import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SIGNATURE } from "../../config.js";
import { findById } from "../base.repository.js";
import { NotFoundException } from "../error.exception.js";
import { UserModel } from "../../DB/model/user.model.js";

export const generateToken =async({
    payload ={},
    opts ={},
    secret = ACCESS_TOKEN_SIGNATURE
}={})=>{
return jwt.sign(payload , secret , opts)
}

export const verifyToken = async({
    token="",
    secret=ACCESS_TOKEN_SIGNATURE
})=>{
    return jwt.verify(token,secret)
}

export const decodeToken = async({authorization})=>{
    const payload = await verifyToken({token:authorization})
    if(!payload?.sub) throw new BadRequestException()
    const account = await findById({model:UserModel , id:payload.sub})
if(!account) throw new NotFoundException("Profile not found")
    return account
}