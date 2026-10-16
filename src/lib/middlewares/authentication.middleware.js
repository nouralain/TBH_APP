import { UnauthorizedException } from "../../pkg/errors/error.exception.js"
import { decodeToken } from "../../pkg/security/token.security.js"
import { getLang } from "../utils/getLanguage.js";

export const authentication = async(req,res,next)=>{
   const lang = getLang(req);


    const {authorization} = req.headers
    if(!authorization) throw new UnauthorizedException(null,lang)
    
    req.user = await decodeToken({authorization})
    next()
}