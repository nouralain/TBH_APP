import successResponse from "../../../pkg/successResponse.js"
import { loginService, registerService } from "../service/auth.services.js"

export const register =async (req,res,next)=>{
    const data=await registerService(req.validate)
    console.log(data);
    
successResponse(res,{message:"User created successfully",status:201,data})
}

export const login =async (req,res,next)=>{
    const data=await loginService(req.validate)
successResponse(res,{data:data})
}


