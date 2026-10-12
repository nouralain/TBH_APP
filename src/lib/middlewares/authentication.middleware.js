import { UnauthorizedException } from "../../pkg/error.exception.js"
import { decodeToken } from "../../pkg/security/token.security.js"

export const authentication = async(req,res,next)=>{
    const {authorization} = req.headers
    if(!authorization) throw new UnauthorizedException()
    
    req.user = await decodeToken({authorization})
    next()
}