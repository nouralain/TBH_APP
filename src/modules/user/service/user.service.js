import { UserModel } from "../../../DB/model/user.model.js"
import { deleteOne, findByIdAndUpdate } from "../../../pkg/services/mongoose.services.js"

export const deleteService = async(id)=>{
await deleteOne({model:UserModel , filter:{_id:id}})
}

export const updateService =async({id , data})=>{
  return await findByIdAndUpdate({model:UserModel, update:data , id , options:{returnDocument:"after"}})
}