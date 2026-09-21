import emailValidation from "../../common/validators/email.validator.js"
import checkNameLength from "../../common/validators/name.validator.js"
import checkPasswordLength from "../../common/validators/password.validator.js"
import jwt from "jsonwebtoken"
import { findUserByIdNoRole, update } from "./user.repo.js";
import { JWT_SECRET } from "../../config.js";
import { findUserByEmail } from "../../common/repo/user.repo.js";

export const updateService =async(id,name,email,password,age,role)=>{

const updatedData={}
if(name){
    updatedData.name=checkNameLength(name)
}
if(email){
    updatedData.email=emailValidation(email)
}
if(age){
    updatedData.age=age
}
if(role){
    updatedData.role=role
}
if(password){
    checkPasswordLength(password)
    updatedData.password=password
}
 await update(id,updatedData)

 const payload = {id,name,role}
 const token = jwt.sign(payload,JWT_SECRET)
 return token


}

export const getUserByEmail = async(email)=>{
    if(!email)throw new Error("No email provided",{cause:{status:400}})
    const isExisted =await findUserByEmail(email)
if(!isExisted)throw new Error("No user found",{cause:{status:404}})
    const {id,name,role,createdAt,updatedAt}=isExisted
return {id,name,email,role,createdAt,updatedAt}
    
}
export const getUserById = async(id)=>{
        if(isNaN(id))throw new Error("Wrong id format",{cause:{status:400}})

    if(!id)throw new Error("No id provided",{cause:{status:400}})
    const isExisted =await findUserByIdNoRole(id)
if(!isExisted)throw new Error("No user found",{cause:{status:404}})
    const {name,email,createdAt,updatedAt}=isExisted
return {id,name,email,createdAt,updatedAt}
    
}