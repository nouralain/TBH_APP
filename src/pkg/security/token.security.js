import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SIGNATURE, REFRESH_TOKEN_SIGNATURE } from "../../config.js";
import { findById } from "../services/mongoose.services.js";
import { NotFoundException } from "../errors/error.exception.js";
import { UserModel } from "../../DB/model/user.model.js";
import { tokenTypeEnum } from "../../lib/enum/tokenType.enum.js";

export const generateToken =async({
    payload ={},
    opts ={},
    secret = ACCESS_TOKEN_SIGNATURE
}={})=>{
    
return jwt.sign(payload , secret , {...opts})
}

 const verifyToken = async({
    token="",
    secret=ACCESS_TOKEN_SIGNATURE
})=>{
    return jwt.verify(token,secret)
}
 const getTokenSignature = ({tokenType}={})=>{
    return tokenType==tokenTypeEnum.ACCESS?ACCESS_TOKEN_SIGNATURE : REFRESH_TOKEN_SIGNATURE
 }

export const decodeToken = async({authorization,tokenType})=>{
    const payload = await verifyToken({token:authorization , secret:getTokenSignature({tokenType})})
    
    if(!payload?.sub) throw new BadRequestException()
    const account = await findById({model:UserModel , id:payload.sub})
if(!account) throw new NotFoundException("Profile not found")
    
    return {account,payload}
}