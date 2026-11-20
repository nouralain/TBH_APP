import { UnauthorizedException } from "../../pkg/errors/error.exception.js"
import { decodeToken } from "../../pkg/security/token.security.js"
import { tokenTypeEnum } from "../enum/tokenType.enum.js";
import { getLang } from "../utils/getLanguage.js";

const JWT_ERRORS = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];

const attachUser = async (req, tokenType) => {
    const { account, payload } = await decodeToken({ authorization: req.headers.authorization, tokenType });
    req.user = account;
    req.payload = payload;
};

const mapError = (error, lang) =>
    JWT_ERRORS.includes(error.name) ? new UnauthorizedException(error.message, lang) : error;

/** Requires a valid token. */
export const authentication = ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
    return async (req, res, next) => {
        const lang = getLang(req);
        try {
            if (!req.headers.authorization) throw new UnauthorizedException(null, lang);
            await attachUser(req, tokenType);
            next();
        } catch (error) {
            next(mapError(error, lang));
        }
    };
};

/**
 * Attaches req.user when a token is sent, lets the request through as a guest when it isn't.
 * A token that is sent but invalid/expired is still rejected with 401, so the client
 * doesn't silently send as a guest by mistake.
 */
export const optionalAuthentication = ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
    return async (req, res, next) => {
        const lang = getLang(req);
        if (!req.headers.authorization) return next();
        try {
            await attachUser(req, tokenType);
            next();
        } catch (error) {
            next(mapError(error, lang));
        }
    };
};
