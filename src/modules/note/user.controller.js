import successResponse from "../../common/utils/successResponse.js"
import { updateService, getUserByEmail, getUserById } from "./user.services.js"

export const update = async (req,res)=>{
     const {name,email,password,age,role} = req.body
     const targetId = parseInt(req.params.id)
     const requesterId = req.user.id
     const requesterRole = req.user.role
     if(targetId!==requesterId && requesterRole!=="admin")throw new Error("You are not authorized to update this user",{cause:{status:401}})
    const data=await updateService(targetId,name,email,password,age,role)
successResponse(res,{message:"User updated successfully",data})
}

export const findByEmail=async(req,res)=>{
    const {email} = req.query
        const data=await getUserByEmail(email)

successResponse(res,{message:"done",data})

}
export const findById=async(req,res)=>{
    const id = Number(req.params.id)
        const data=await getUserById(id)
successResponse(res,{message:"done",data})

}