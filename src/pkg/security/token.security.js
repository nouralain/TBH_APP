import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SIGNATURE } from "../../config.js";

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