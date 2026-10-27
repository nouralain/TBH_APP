import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { getLang } from "../../../lib/utils/getLanguage.js"
import successResponse from "../../../pkg/successResponse.js"
import { loginService, registerService ,confirmOtpService,resendOtpService} from "../service/auth.services.js"
import { translations } from "../translations.js"

export const register =async (req,res,next)=>{
    const lang = getLang(req);
    const data=await registerService(req.validate ,lang)
    console.log(data);
    
successResponse(res,{message:lang===languagesEnum.EN?translations.USER_CREATED.EN:translations.USER_CREATED.EN,status:201,data})
}

export const login =async (req,res,next)=>{
    const lang = getLang(req);

    const data=await loginService(req.validate,lang)
successResponse(res,{data:data})
}

export const confirmOtp = async(req,res,next)=>{
    const lang = getLang(req);

    const data=await confirmOtpService(req.validate,lang)

    successResponse(res,{data:data})

}
export const resendOtp = async(req,res,next)=>{
    const lang = getLang(req);

    const data=await resendOtpService(req.validate,lang)

    successResponse(res,{data:data})

}

