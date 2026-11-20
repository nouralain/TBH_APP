import { ACCESS_TOKEN_EXPIRY } from "../../../config.js"
import { UserModel } from "../../../DB/model/user.model.js"
import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { ConflictException, NotFoundException } from "../../../pkg/errors/error.exception.js"
import { encrypt } from "../../../pkg/security/encrypt.security.js"
import { deleteOne, findByIdAndUpdate, findOne, updateOne } from "../../../pkg/services/mongoose.services.js"
import { getLoginCredintials } from "../../auth/service/auth.services.js"
import { translations } from "../translations.user.js"

export const deleteService = async(id)=>{
  await deleteOne({model:UserModel , filter:{_id:id}})
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
    if (isTaken) throw new ConflictException(
      lang === languagesEnum.EN ? translations.USERNAME_TAKEN.EN : translations.USERNAME_TAKEN.AR,
      lang
    )
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
  if (!user) throw new NotFoundException(
    lang === languagesEnum.EN ? translations.USER_NOT_FOUND.EN : translations.USER_NOT_FOUND.AR,
    lang
  )

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
  await updateOne({model:UserModel , filter:{_id:id} , update:{$set:{blockedUsers:[]}}})
}

/**
 * 1. accept the payload of the refresh token -> from auth middleware
 * 2. get the expiry date of the access token issued alongside it
 * 3. if it is still valid throw conflict error
 * 4. return new access and refresh tokens
 */
export const rotateToken = async({payload,lang})=>{
  const accessExpireDate = (payload.iat + ACCESS_TOKEN_EXPIRY) * 1000
  if(Date.now()<accessExpireDate)throw new ConflictException(
    lang === languagesEnum.EN ? translations.TOKEN_STILL_VALID.EN : translations.TOKEN_STILL_VALID.AR,
    lang
  );

  // Build a fresh payload: re-signing the old one fails because it already carries iat/exp.
  return await getLoginCredintials({payload:{ userName:payload.userName, sub:payload.sub }})
}
