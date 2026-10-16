import { languagesEnum } from "../../../lib/enum/languages.enum.js"
import { getLang } from "../../../lib/utils/getLanguage.js"
import successResponse from "../../../pkg/successResponse.js"
import { deleteService,updateService } from "../service/user.service.js"
import { translations } from "../translations.user.js"

export const profileController = async(req,res,next)=>{
    successResponse(res,{data:req.user})    
}

export const deleteController = async(req,res,next)=>{
    const lang = getLang(req);

    await deleteService(req.user.id)
    successResponse(res,{message:lang===languagesEnum.EN?translations.USER_DELETED.EN:translations.USER_DELETED.EN})    
}

export const UpdateController = async(req,res,next)=>{
    const lang = getLang(req);

   const account =  await updateService({id:req.user.id , data:req.validate})
    successResponse(res,{message:lang===languagesEnum.EN?translations.USER_UPDATED.EN:translations.USER_UPDATED.EN ,data:account})    

}