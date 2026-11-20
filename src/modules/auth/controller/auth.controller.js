import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { getLang } from "../../../lib/utils/getLanguage.js"
import { hashIp } from "../../../lib/utils/ipHash.js"
import successResponse from "../../../pkg/successResponse.js"
import { loginService, registerService ,confirmOtpService,resendOtpService,signupWithGoogleService} from "../service/auth.services.js"
import { translations } from "../translations.js"

export const register =async (req,res,next)=>{
    const lang = getLang(req);
    const data=await registerService(req.validate.body ,lang)
    successResponse(res,{message:lang===languagesEnum.AR?translations.USER_CREATED.AR:translations.USER_CREATED.EN,status:201,data})
}

export const login =async (req,res,next)=>{
    const lang = getLang(req);
    // the login lock is per email + IP (D2), only the HMAC of the IP is stored
    const data=await loginService(req.validate.body,lang,hashIp(req.ip))
    successResponse(res,{data})
}

export const confirmOtp = async(req,res,next)=>{
    const lang = getLang(req);
    const data=await confirmOtpService(req.validate.body,lang)
    successResponse(res,{data})
}

export const resendOtp = async(req,res,next)=>{
    const lang = getLang(req);
    const data=await resendOtpService(req.validate.body,lang)
    successResponse(res,{data})
}

export const signUpWithGoogle = async(req,res,next)=>{
    const lang = getLang(req);
    const data=await signupWithGoogleService(req.validate.body,lang)
    successResponse(res,{data})
}
