import { ACCESS_TOKEN_EXPIRY } from "../../../config.js"
import { UserModel } from "../../../DB/model/user.model.js"
import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { ConflictException } from "../../../pkg/errors/error.exception.js"
import { deleteOne, findByIdAndUpdate } from "../../../pkg/services/mongoose.services.js"
import { getLoginCredintials } from "../../auth/service/auth.services.js"
import { translations } from "../translations.user.js"

export const deleteService = async(id)=>{
await deleteOne({model:UserModel , filter:{_id:id}})
}

export const updateService =async({id , data})=>{
  return await findByIdAndUpdate({model:UserModel, update:data , id , options:{returnDocument:"after"}})
}


/**
 * 1. accept the payload of the token -> from auth middlware
 * 2. get the expiry date of the access token
 * 3. check if still valid throw conflict error
 * 4. return both new rotate and access tokens
 */
export const rotateToken = async({payload,lang})=>{
const accessExpireDate = (payload.iat + ACCESS_TOKEN_EXPIRY) * 1000
const currentDate =  Date.now()
if(currentDate<accessExpireDate)throw new ConflictException(
  lang === languagesEnum.EN ? translations.TOKEN_STILL_VALID.EN : translations.TOKEN_STILL_VALID.AR,
  lang
);

return await getLoginCredintials({payload , id:payload.sub})


}
