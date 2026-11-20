import { ACCESS_TOKEN_EXPIRY } from "../../../config.js"
import { UserModel } from "../../../DB/model/user.model.js"
import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { ConflictException } from "../../../pkg/errors/error.exception.js"
import { encrypt } from "../../../pkg/security/encrypt.security.js"
import { deleteOne, findByIdAndUpdate } from "../../../pkg/services/mongoose.services.js"
import { getLoginCredintials } from "../../auth/service/auth.services.js"
import { translations } from "../translations.user.js"

export const deleteService = async(id)=>{
  await deleteOne({model:UserModel , filter:{_id:id}})
}

export const updateService =async({id , data})=>{
  const update = { ...data }
  if (update.phone) update.phone = await encrypt(update.phone)
  return await findByIdAndUpdate({model:UserModel, update , id , options:{returnDocument:"after", runValidators:true}})
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
