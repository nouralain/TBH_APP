import { UserModel } from "../../../DB/model/user.model.js"
import { encrypt } from "../../../pkg/security/encrypt.security.js"
import { compare, hash } from "../../../pkg/security/hash.security.js"
import { generateToken } from "../../../pkg/security/token.security.js"
import { createOne, findOne } from "../../../pkg/services/mongoose.services.js"
import { BadRequestException, ConflictException, WrongCredintials } from "../../../pkg/errors/error.exception.js"
import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { translations } from "../translations.js"
import Crypto from "node:crypto"
import { sendEmail } from "../../../lib/utils/email/sendEmail.js"
import { sendOtpTemplate } from "../../../lib/utils/email/templates/emailTemplate.js"
import {  exists, expire, get, incr, remove, set,ttl } from "../../../pkg/services/redis.services.js"
import { EmailSubject } from "../../../lib/enum/subject.enum.js"
export const generateCode = ()=>{
  return Crypto.randomInt(100000,1000000).toString()
}

export const sendOtpKey =(email)=>`User::${email}::${EmailSubject.sentOtp}`
export const profileDataKey =(email)=>`User::${email}::Profile-data`
export const resendTrialKey =(email)=>`User::${email}::trials`

/**
   * 1. generate random otp
   * 2. send this otp via sendemail func
   * 3. store this otp in redis with ttl 
   * 4. 
   */
  
const GenerateOtpAndSendEmail = async(email)=>{
  const generatedOtp = generateCode()
  await set(
    {
    key:sendOtpKey(email),
    value:await hash({plainText:generatedOtp}),
    ttl:120
  })
  await sendEmail({
    to:"nunaahmed74@gmail.com",
    subject:"Send otp",
    html:sendOtpTemplate("nunaahmed74@gmail.com",generatedOtp),

  })
}

export const registerService =async (body,lang)=>{
  const {userName , email , password , phone, age , gender } = body
    const isExistedDb = await findOne({model:UserModel , filter:{email:email},select:-password})
if(isExistedDb) throw new ConflictException(lang===languagesEnum.EN?translations.EMAIL_EXISTS.EN:translations.EMAIL_EXISTS.AR)

  GenerateOtpAndSendEmail(email)

const hashedPassword = await hash({plainText:password} )
const encryptedPhone = await encrypt(phone)
  await set({
  key:profileDataKey(email),
  value:{userName , email , password:hashedPassword , phone:encryptedPhone, age , gender},
  ttl: 500
 })
//  return await createOne({model:UserModel , data:{userName , email , password:hashedPassword , phone:encryptedPhone, age , gender}})

}

export const loginService=async(body,lang)=>{
  const {email , password} = body
  const isExisted = await findOne({model:UserModel , filter:{email:email},select:-password})
if(!isExisted)throw new WrongCredintials(undefined , lang)

  const isMatched = await compare({plainText:password , hashText:isExisted.password})
  if(!isMatched)throw new WrongCredintials(undefined , lang)

  return await generateToken({payload:{userName:isExisted.userName},opts:{
    subject:isExisted.id,
    expiresIn:1800,

  }})  
}

/**
 * 1. check if email exist in cache by the ttl 
 * 2. check that otp in body same as otp in cache
 * 3. create the document in db 
 * 4. delete the cached profile data
 */
export const confirmOtpService= async(body,lang)=>{
const {email , otp} = body
  let isExisted = await get({key:profileDataKey(email)})
  if( !isExisted) throw new BadRequestException(lang===languagesEnum.EN?translations.INVALID_SIGNUP_SESSION.EN:translations.INVALID_SIGNUP_SESSION.AR)
   
    const storedOtp = await get({ key: sendOtpKey(email) });
    if(!storedOtp) throw new BadRequestException(lang===languagesEnum.EN?translations.EXPIRED_OTP.EN:translations.EXPIRED_OTP.AR)
    const isMatched =await compare({plainText:otp , hashText:storedOtp})

if (!isMatched) {
 throw new BadRequestException(lang===languagesEnum.EN?translations.INVALID_OTP.EN:translations.INVALID_OTP.AR)
}

await remove({key:profileDataKey(email)})
await remove({key:sendOtpKey(email)})
return await createOne({model:UserModel , data:{userName:isExisted.userName , email , password:isExisted.password , phone:isExisted.phone, age:isExisted.age , gender:isExisted.gender}})
}

/**
 * 1. confirm that no current otp cached for same email
 * 2. confirm user trials <3
 * 3. send otp
 * 4. overwrite same profile key to reset the ttl 
 * 5. store trials key in cache and inc by 1
 */
export const resendOtpService = async(body,lang)=>{
const {email} = body
const isExisted = await exists({key:profileDataKey(email)})
if(!isExisted)throw new BadRequestException(lang===languagesEnum.EN?translations.INVALID_SIGNUP_SESSION.EN:translations.INVALID_SIGNUP_SESSION.AR)
const timeTL = await ttl({key:sendOtpKey(email)})
console.log(timeTL);
if(timeTL>0)throw new ConflictException(lang===languagesEnum.EN?translations.OTP_ALREADY_SENT.EN:translations.OTP_ALREADY_SENT.AR)

const trials = await get({key:resendTrialKey(email)})
if(trials>3) throw new BadRequestException(lang===languagesEnum.EN?translations.MAX_RESEND_ATTEMPTS.EN:translations.MAX_RESEND_ATTEMPTS.AR)

GenerateOtpAndSendEmail(email)

const updatedTrials = await incr({key:resendTrialKey(email)});
if (updatedTrials === 1) {
  await expire({
    key:resendTrialKey(email),
    ttl: 300
  });
}
 await expire({ 
  key: profileDataKey(email), 
  ttl: 500 
});


}