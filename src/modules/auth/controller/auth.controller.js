import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { getLang } from "../../../lib/utils/getLanguage.js"
import successResponse from "../../../pkg/successResponse.js"
import { loginService, registerService } from "../service/auth.services.js"
import { translations } from "../translations.js"

export const register =async (req,res,next)=>{
    const lang = getLang(req);
    const data=await registerService(req.validate ,lang)
    console.log(data);
    
successResponse(res,{message:lang===languagesEnum.EN?translations.USER_CREATED.EN:translations.USER_CREATED.EN,status:201,data})
}

export const login =async (req,res,next)=>{
    const data=await loginService(req.validate)
successResponse(res,{data:data})
}


