import { getLang } from "../../../lib/utils/getLanguage.js"
import { t } from "../../../lib/utils/translate.js"
import successResponse from "../../../pkg/successResponse.js"
import { deleteService,logoutService,profileService,publicProfileService,rotateToken,unblockAllService,updateService } from "../service/user.service.js"
import { translations } from "../translations.user.js"

export const profileController = async(req,res,next)=>{
    const data = await profileService(req.user)
    successResponse(res,{message:t(translations,"PROFILE_FETCHED",getLang(req)),data})
}

// no token needed: the person visiting the share link may not have an account
export const publicProfileController = async(req,res,next)=>{
    const lang = getLang(req);
    const data = await publicProfileService({username:req.validate.params.username , lang})
    successResponse(res,{message:t(translations,"PROFILE_FETCHED",lang),data})
}

export const unblockAllController = async(req,res,next)=>{
    const lang = getLang(req);
    await unblockAllService({id:req.user.id})
    successResponse(res,{message:t(translations,"UNBLOCKED_ALL",lang)})
}

export const deleteController = async(req,res,next)=>{
    const lang = getLang(req);
    await deleteService({id:req.user.id , payload:req.payload})
    successResponse(res,{message:t(translations,"USER_DELETED",lang)})
}

export const UpdateController = async(req,res,next)=>{
    const lang = getLang(req);
    const account = await updateService({id:req.user.id , data:req.validate.body , lang})
    successResponse(res,{message:t(translations,"USER_UPDATED",lang) ,data:account})
}

// E5: body { allDevices?: boolean }
export const logoutController = async(req,res,next)=>{
    const lang = getLang(req);
    const allDevices = req.validate.body.allDevices === true
    await logoutService({id:req.user.id , payload:req.payload , allDevices})
    successResponse(res,{message:t(translations,allDevices?"LOGGED_OUT_ALL":"LOGGED_OUT",lang)})
}

export const rotateTokenController = async(req,res,next)=>{
    const lang = getLang(req);
    const data = await rotateToken({payload:req.payload , lang})
    successResponse(res,{message:t(translations,"TOKEN_REFRESHED_SUCCESS",lang) , data})
}
