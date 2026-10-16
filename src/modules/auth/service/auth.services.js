import { UserModel } from "../../../DB/model/user.model.js"
import { encrypt } from "../../../pkg/security/encrypt.security.js"
import { compare, hash } from "../../../pkg/security/hash.security.js"
import { generateToken } from "../../../pkg/security/token.security.js"
import { createOne, findOne } from "../../../pkg/base.repository.js"
import { ConflictException, WrongCredintials } from "../../../pkg/errors/error.exception.js"
import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { translations } from "../translations.js"

export const registerService =async (body,lang)=>{
  const {userName , email , password , phone, age , gender } = body
    const isExisted = await findOne({model:UserModel , filter:{email:email},select:-password})
if(isExisted) throw new ConflictException(lang===languagesEnum.EN?translations.EMAIL_EXISTS.EN:translations.EMAIL_EXISTS.AR)
console.log(isExisted);

const hashedPassword = await hash({plainText:password} )
const encryptedPhone = await encrypt(phone)
console.log(encryptedPhone);

 return await createOne({model:UserModel , data:{userName , email , password:hashedPassword , phone:encryptedPhone, age , gender}})

}

export const loginService=async({email,password})=>{
  const isExisted = await findOne({model:UserModel , filter:{email:email},select:-password})
if(!isExisted)throw new WrongCredintials()

  const isMatched = await compare({plainText:password , hashText:isExisted.password})
  if(!isMatched)throw new WrongCredintials()

  return await generateToken({payload:{userName:isExisted.userName},opts:{
    subject:isExisted.id,
    expiresIn:1800,

  }})  
}