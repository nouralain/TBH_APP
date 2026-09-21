import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import emailValidation from '../../common/validators/email.validator.js';
import checkPasswordLength from '../../common/validators/password.validator.js';
import checkNameLength from './../../common/validators/name.validator.js';
import { create } from './auth.repo.js';
import { JWT_SECRET } from "../../config.js";
import { findUserByEmail } from "../../common/repo/user.repo.js";

export const registerService =async (name,email,password)=>{
    //add validation to all parameters and trim them if validation error throw error
const trimmedName = checkNameLength(name)
const trimmedEmail = emailValidation(email)
checkPasswordLength(password)
    //check if email existed before then throw error
    const isExisted = await findUserByEmail(trimmedEmail)
    if(isExisted)throw new Error("This email already exists",{cause:{status:409}})
    //hash password through bcrypt 
const hashedPassword = await bcrypt.hash(password,10)

    //add user to db and return his name email token
    const userData =await create(trimmedName,trimmedEmail,hashedPassword)
    
return userData
}

export const loginService =async (email,password)=>{
     //add validation to all parameters and trim them if validation error throw error
const trimmedEmail = emailValidation(email)
checkPasswordLength(password)
    //check if user existed
    const isExisted = await findUserByEmail(trimmedEmail)
        if(!isExisted)throw new Error("Wrong credintials",{cause:{status:401}})
        //check for user pass
const isMatched = await bcrypt.compare(password,isExisted.password)
if(!isMatched)throw new Error("Wrong credintials",{cause:{status:401}})
    //generate token
const payload={id:isExisted.id,name:isExisted.name,role:isExisted.role}
const token = jwt.sign(payload,JWT_SECRET)
return token

}

