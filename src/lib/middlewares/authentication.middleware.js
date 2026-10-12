import { UnauthorizedException } from "../../pkg/error.exception.js"
import { decodeToken } from "../../pkg/security/token.security.js"

export const authentication = async(req,res,next)=>{
    const {authentication} = req.headers
    if(!authentication) throw new UnauthorizedException()
    
    req.user = await decodeToken({authentication})
    next()
}