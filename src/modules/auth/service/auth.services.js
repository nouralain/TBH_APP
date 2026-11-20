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
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SIGNATURE } from "../../../config.js"
import { verifyTokenId } from "../../../lib/utils/verifyTokenId.js"
import { generateUsername } from "../../../lib/utils/generateUsername.js"
import { providerEnum } from "../../../lib/enum/provider.enum.js"

const OTP_TTL_SECONDS = 120
const PROFILE_TTL_SECONDS = 500
const MAX_RESEND_ATTEMPTS = 3
const RESEND_WINDOW_SECONDS = 300

const t = (key, lang) => lang === languagesEnum.AR ? translations[key].AR : translations[key].EN

export const generateCode = ()=>{
  return Crypto.randomInt(100000,1000000).toString()
}

export const sendOtpKey =(email)=>`User::${email}::${EmailSubject.sentOtp}`
export const profileDataKey =(email)=>`User::${email}::Profile-data`
export const resendTrialKey =(email)=>`User::${email}::trials`

/**
 * 1. generate random otp
 * 2. store the hashed otp in redis with ttl
 * 3. email the plain otp to the user who is signing up
 * Awaited by callers so an SMTP failure surfaces as an error instead of a silent no-op.
 */
const generateOtpAndSendEmail = async(email)=>{
  const generatedOtp = generateCode()
  await set({
    key:sendOtpKey(email),
    value:await hash({plainText:generatedOtp}),
    ttl:OTP_TTL_SECONDS
  })
  await sendEmail({
    to:email,
    subject:"Send otp",
    html:sendOtpTemplate(email,generatedOtp, Math.round(OTP_TTL_SECONDS/60)),
  })
}

export const registerService =async (body,lang)=>{
  const {userName , email , password , phone, age , gender } = body
  const isExistedDb = await findOne({model:UserModel , filter:{email}})
  if(isExistedDb) throw new ConflictException(t("EMAIL_EXISTS",lang), lang)

  const hashedPassword = await hash({plainText:password} )
  const encryptedPhone = await encrypt(phone)
  await set({
    key:profileDataKey(email),
    value:{userName , email , password:hashedPassword , phone:encryptedPhone, age , gender},
    ttl: PROFILE_TTL_SECONDS
  })

  await generateOtpAndSendEmail(email)
}

export const loginService=async(body,lang)=>{
  const {email , password} = body
  const isExisted = await findOne({model:UserModel , filter:{email}})
  if(!isExisted)throw new WrongCredintials(undefined , lang)

  // Accounts created with Google have no password.
  if(isExisted.provider !== providerEnum.SYSTEM) throw new BadRequestException(t("GOOGLE_ACCOUNT_LOGIN",lang), lang)

  const isMatched = await compare({plainText:password , hashText:isExisted.password})
  if(!isMatched)throw new WrongCredintials(undefined , lang)

  return await getLoginCredintials({payload:{userName:isExisted.userName , sub:isExisted.id}})
}

/** Google sometimes returns a single-word name; the model needs first and last name (2+ chars each). */
const splitGoogleName = ({ given_name, family_name, name = "" }) => {
  const [first, ...rest] = name.trim().split(/\s+/)
  const firstName = given_name || first || "user"
  const lastName = family_name || rest.join(" ") || firstName
  return { firstName, lastName }
}

/**
 * 1. verify the Google idToken
 * 2. if the email is new, create a GMAIL user and log them in
 * 3. if it exists as a GMAIL user, log them in
 * 4. if it exists as a SYSTEM (password) user, refuse
 */
export const signupWithGoogleService=async(body,lang)=>{
  const { idToken } = body;
  const payload = await verifyTokenId(idToken, lang)
  const { email } = payload

  let user = await findOne({model:UserModel , filter:{email}})
  if(!user){
    const { firstName, lastName } = splitGoogleName(payload)
    // every new user gets a username so people can send him messages with a share link
    const username = await generateUsername(firstName)
    user = await createOne({model:UserModel , data:{firstName , lastName , username , email , provider:providerEnum.GMAIL}})
  } else if(user.provider === providerEnum.SYSTEM){
    throw new ConflictException(t("STANDARD_LOGIN_ERROR",lang), lang)
  }

  // sub must be our Mongo id (not Google's sub) so decodeToken can find the account.
  return await getLoginCredintials({payload:{userName:user.userName , sub:user.id}})
}

export const getLoginCredintials = async({payload={} , opts={}})=>{
  const accessToken= await generateToken({payload,opts:{ ...opts, expiresIn:ACCESS_TOKEN_EXPIRY }})
  const refreshToken= await generateToken({payload,secret:REFRESH_TOKEN_SIGNATURE,opts:{ ...opts, expiresIn:REFRESH_TOKEN_EXPIRY }})
  return {accessToken,refreshToken}
}

/**
 * 1. check the signup session still exists in cache
 * 2. check that otp in body matches the cached hash
 * 3. create the document in db
 * 4. delete the cached profile data and otp
 */
export const confirmOtpService= async(body,lang)=>{
  const {email , otp} = body
  const isExisted = await get({key:profileDataKey(email)})
  if(!isExisted) throw new BadRequestException(t("INVALID_SIGNUP_SESSION",lang), lang)

  const storedOtp = await get({ key: sendOtpKey(email) });
  if(!storedOtp) throw new BadRequestException(t("EXPIRED_OTP",lang), lang)

  const isMatched =await compare({plainText:otp , hashText:storedOtp})
  if (!isMatched) throw new BadRequestException(t("INVALID_OTP",lang), lang)

  await remove({key:profileDataKey(email)})
  await remove({key:sendOtpKey(email)})
  await remove({key:resendTrialKey(email)})
  // userName is "first last" -> we take the first word to build the username (ex: nour_4821)
  const username = await generateUsername(isExisted.userName.split(" ")[0])
  return await createOne({model:UserModel , data:{userName:isExisted.userName , username , email , password:isExisted.password , phone:isExisted.phone, age:isExisted.age , gender:isExisted.gender}})
}

/**
 * 1. confirm that no current otp is cached for the same email
 * 2. confirm user resend attempts are under the limit
 * 3. send otp
 * 4. extend the profile key ttl
 */
export const resendOtpService = async(body,lang)=>{
  const {email} = body
  const isExisted = await exists({key:profileDataKey(email)})
  if(!isExisted)throw new BadRequestException(t("INVALID_SIGNUP_SESSION",lang), lang)

  const timeTL = await ttl({key:sendOtpKey(email)})
  if(timeTL>0)throw new ConflictException(t("OTP_ALREADY_SENT",lang), lang)

  const trials = Number(await get({key:resendTrialKey(email)})) || 0
  if(trials >= MAX_RESEND_ATTEMPTS) throw new BadRequestException(t("MAX_RESEND_ATTEMPTS",lang), lang)

  await generateOtpAndSendEmail(email)

  const updatedTrials = await incr({key:resendTrialKey(email)});
  if (updatedTrials === 1) {
    await expire({ key:resendTrialKey(email), ttl: RESEND_WINDOW_SECONDS });
  }
  await expire({ key: profileDataKey(email), ttl: PROFILE_TTL_SECONDS });
}
