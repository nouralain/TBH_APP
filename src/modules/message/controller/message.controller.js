import successResponse from "../../../pkg/successResponse.js"
import { createMessageService } from "../service/message.service.js"

export const createMessage = async(req,res)=>{
   const data = await createMessageService()
    successResponse()
}