import successResponse from "../../common/utils/successResponse.js"
import { registerService,loginService } from "./auth.services.js"

export const register =async (req,res,next)=>{
    const {name,email,password} = req.body
    const data=await registerService(name,email,password)
successResponse(res,{message:"User created successfully",status:201,data})
}

export const login =async (req,res,next)=>{
  const {email,password} = req.body
    const data=await loginService(email,password)
successResponse(res,{data})
}


