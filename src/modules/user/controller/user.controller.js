import successResponse from "../../../pkg/successResponse.js"
import { deleteService,updateService } from "../service/user.service.js"

export const profileController = async(req,res,next)=>{
    successResponse(res,{data:req.user})    
}

export const deleteController = async(req,res,next)=>{
    await deleteService(req.user.id)
    successResponse(res,{message:"User deleted successfully"})    
}

export const UpdateController = async(req,res,next)=>{
   const account =  await updateService({id:req.user.id , data:req.validate})
    successResponse(res,{message:"User Updated successfully" ,data:account})    

}