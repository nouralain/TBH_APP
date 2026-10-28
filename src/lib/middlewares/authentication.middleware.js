import { UnauthorizedException } from "../../pkg/errors/error.exception.js"
import { decodeToken } from "../../pkg/security/token.security.js"
import { tokenTypeEnum } from "../enum/tokenType.enum.js";
import { getLang } from "../utils/getLanguage.js";

export const authentication = ({tokenType = tokenTypeEnum.ACCESS} = {}) => {
    return async (req, res, next) => {
         const lang = getLang(req);
      
         try {
              const { authorization } = req.headers;
              if (!authorization) {
                  throw new UnauthorizedException(null, lang);
              }
              
              const {account , payload} = await decodeToken({ authorization, tokenType });
              req.user = account
              req.payload = payload
              next();
         } catch (error) {
              if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
                  return next(new UnauthorizedException(error.message, lang));
              }
              next(error);
         }
    }
 }