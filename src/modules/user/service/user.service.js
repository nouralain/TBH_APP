import { ACCESS_TOKEN_EXPIRY } from "../../../config.js"
import { UserModel } from "../../../DB/model/user.model.js"
import { MessageModel } from "../../../DB/model/message.model.js"
import { ConflictException, NotFoundException } from "../../../pkg/errors/error.exception.js"
import { decrypt, encrypt } from "../../../pkg/security/encrypt.security.js"
import { revokeSession } from "../../../pkg/security/token.security.js"
import { deleteMany, deleteOne, findByIdAndUpdate, findOne, updateMany, updateOne } from "../../../pkg/services/mongoose.services.js"
import { t as translate } from "../../../lib/utils/translate.js"
import { logger } from "../../../lib/utils/logger.js"
import { getLoginCredintials } from "../../auth/service/auth.services.js"
import { translations } from "../translations.user.js"

const t = (key, lang) => translate(translations, key, lang)

// revoking needs Redis; if it's down the account deletion still goes through (D4: fail open)
const tryRevokeSession = async (payload) => {
  try {
    await revokeSession(payload)
  } catch (error) {
    logger.warn("could not revoke session, Redis unavailable:", error.message)
  }
}

/**
 * E6: the owner's own profile -> same JSON as before + the phone decrypted.
 * (toJSON still strips the phone everywhere else, so it never leaks in other responses)
 */
export const profileService = async(user)=>{
  const profile = user.toJSON()
  const phone = await decrypt(user.phone)
  if (phone) profile.phone = phone
  return profile
}

/**
 * E4: delete account cascade
 * 1. messages he RECEIVED -> deleted (nobody can read them anymore anyway)
 * 2. messages he SENT -> kept for their receivers but anonymized:
 *    senderId removed + isAnonymous forced to true, so the receiver no longer sees a name
 *    that points to a deleted account
 * 3. remove him from other users' block lists
 * 4. delete the user (last: if a step above fails he can simply try again)
 * 5. revoke the session that made the request (any other token dies because the account is gone)
 */
export const deleteService = async({ id, payload })=>{
  //1
  await deleteMany({model:MessageModel , filter:{receiverId:id}})
  //2
  await updateMany({model:MessageModel , filter:{senderId:id} , update:{$unset:{senderId:""} , $set:{isAnonymous:true}}})
  //3
  await updateMany({model:UserModel , filter:{blockedUsers:id} , update:{$pull:{blockedUsers:id}}})
  //4
  await deleteOne({model:UserModel , filter:{_id:id}})
  //5
  await tryRevokeSession(payload)
}

/**
 * 1. if he wants a new username -> make sure no OTHER user has it
 *    ($ne = "not equal", so if he sends his own current username it's not a conflict)
 * 2. encrypt the phone before saving (same as signup)
 * 3. update and return the new document
 */
export const updateService =async({id , data , lang})=>{
  const update = { ...data }

  //1
  if (update.username) {
    const isTaken = await findOne({model:UserModel , filter:{username:update.username , _id:{$ne:id}}})
    if (isTaken) throw new ConflictException(t("USERNAME_TAKEN", lang), lang)
  }

  //2
  if (update.phone) update.phone = await encrypt(update.phone)

  //3
  return await findByIdAndUpdate({model:UserModel, update , id , options:{returnDocument:"after", runValidators:true}})
}

/**
 * public profile used by the "send me a message" page (/u/:username)
 * anyone can call it, even without a token, so we return ONLY safe fields:
 * no email, no phone, no age, nothing private
 */
export const publicProfileService = async({username , lang})=>{
  const user = await findOne({model:UserModel , filter:{username} , select:"firstName lastName username allowAnonymousMessages" , options:{lean:true}})
  if (!user) throw new NotFoundException(t("USER_NOT_FOUND", lang), lang)

  return {
    id: user._id,
    userName: `${user.firstName} ${user.lastName}`,
    username: user.username,
    // the frontend uses this to hide the "send anonymously" option
    // (old users don't have the field -> treat as true)
    allowAnonymousMessages: user.allowAnonymousMessages !== false,
  }
}

/**
 * unblock everyone at once.
 * we can't show a "blocked users" list to pick from (it would reveal anonymous senders),
 * so the receiver can either unblock one sender from a message (DELETE /api/messages/:noteId/block-sender)
 * or clear the whole list with this.
 */
export const unblockAllService = async({id})=>{
  await updateOne({model:UserModel , filter:{_id:id} , update:{$set:{blockedUsers:[], blockedGuests:[]}}})
}

/**
 * E5: logout
 * - default: ends THIS session (its access + refresh token share one jti -> both are revoked)
 * - allDevices: credentialsChangedAt = now -> every token issued before is rejected
 * tokens from before E5 have no jti, so for them only "all devices" can work -> we use it.
 */
export const logoutService = async({ id, payload, allDevices })=>{
  if (allDevices || !payload?.jti) {
    await updateOne({model:UserModel , filter:{_id:id} , update:{$set:{credentialsChangedAt:new Date()}}})
    return
  }
  await revokeSession(payload)
}

/**
 * 1. accept the payload of the refresh token -> from auth middleware
 * 2. get the expiry date of the access token issued alongside it
 * 3. if it is still valid throw conflict error
 * 4. E5: revoke the old session -> the old refresh token can't be used a second time
 * 5. return new access and refresh tokens (new session id)
 */
export const rotateToken = async({payload,lang})=>{
  const accessExpireDate = (payload.iat + ACCESS_TOKEN_EXPIRY) * 1000
  if(Date.now()<accessExpireDate)throw new ConflictException(t("TOKEN_STILL_VALID", lang), lang);

  await revokeSession(payload)
  // Build a fresh payload: re-signing the old one fails because it already carries iat/exp.
  return await getLoginCredintials({payload:{ userName:payload.userName, sub:payload.sub }})
}
