import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ACCESS_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SIGNATURE } from "../../config.js";
import { findById } from "../services/mongoose.services.js";
import { exists, set } from "../services/redis.services.js";
import { client } from "../../cache/redis.connection.js";
import { ServiceUnavailableException, UnauthorizedException } from "../errors/error.exception.js";
import { UserModel } from "../../DB/model/user.model.js";
import { tokenTypeEnum } from "../../lib/enum/tokenType.enum.js";
import { tc } from "../../lib/utils/translate.js";
import { logger } from "../../lib/utils/logger.js";

export const generateToken = async({ payload = {}, opts = {}, secret = ACCESS_TOKEN_SIGNATURE } = {})=>{
  return jwt.sign(payload, secret, { ...opts })
}

const verifyToken = async({ token = "", secret = ACCESS_TOKEN_SIGNATURE })=>{
  return jwt.verify(token, secret)
}

const getTokenSignature = ({ tokenType } = {})=>{
  return tokenType == tokenTypeEnum.ACCESS ? ACCESS_TOKEN_SIGNATURE : REFRESH_TOKEN_SIGNATURE
}

/**
 * E3: the standard header is "Authorization: Bearer <token>".
 * a bare token (no scheme) is still accepted so old Postman requests keep working.
 * any other scheme (ex: the old "Hamada__<token>") is rejected.
 */
export const extractToken = (authorization = "") => {
  const value = String(authorization).trim()
  const [scheme, token, ...rest] = value.split(/\s+/)
  if (rest.length) return null
  if (token) return scheme.toLowerCase() === "bearer" ? token : null
  return scheme || null
}

/* ============================== E5: revocation ============================== */

// the access and refresh token of one login share the same jti (session id),
// so revoking it ends both of them at once
const revokedKey = (jti) => `RevokedToken::${jti}`

// remembered until the refresh token of that session would have expired anyway
export const revokeSession = async (payload) => {
  if (!payload?.jti) return
  const ttl = Math.max(1, (payload.iat ?? 0) + REFRESH_TOKEN_EXPIRY - Math.floor(Date.now() / 1000))
  await set({ key: revokedKey(payload.jti), value: "1", ttl })
}

/**
 * Redis down:
 *  - refresh token -> 503 (a revoked refresh token could otherwise mint new tokens forever)
 *  - access token  -> let it through; it's short-lived and D4 keeps the app usable without Redis
 */
const assertNotRevoked = async (payload, tokenType, lang) => {
  if (!payload.jti) return
  if (!client.isReady) {
    if (tokenType == tokenTypeEnum.REFRESH) throw new ServiceUnavailableException(null, lang)
    logger.warn("token denylist skipped, Redis unavailable")
    return
  }
  if (await exists({ key: revokedKey(payload.jti) })) throw new UnauthorizedException(tc("TOKEN_REVOKED", lang), lang)
}

// "log out of every device" / account changes: tokens issued before credentialsChangedAt are dead
// (iat is in seconds -> compare in seconds)
const assertIssuedAfterCredentialsChange = (payload, account, lang) => {
  const changedAt = account.credentialsChangedAt?.getTime?.()
  if (changedAt && payload.iat < Math.floor(changedAt / 1000)) {
    throw new UnauthorizedException(tc("TOKEN_REVOKED", lang), lang)
  }
}

/** new session id for a login / rotation, shared by the access + refresh token */
export const newSessionId = () => randomUUID()

export const decodeToken = async({ authorization, tokenType, lang })=>{
  const token = extractToken(authorization)
  if (!token) throw new UnauthorizedException(tc("INVALID_TOKEN", lang), lang)

  const payload = await verifyToken({ token, secret: getTokenSignature({ tokenType }) })
  if (!payload?.sub) throw new UnauthorizedException(tc("INVALID_TOKEN", lang), lang)

  await assertNotRevoked(payload, tokenType, lang)

  // deleted account -> 401 (the token belongs to nobody anymore), not 404
  const account = await findById({ model: UserModel, id: payload.sub })
  if (!account) throw new UnauthorizedException(tc("PROFILE_NOT_FOUND", lang), lang)

  assertIssuedAfterCredentialsChange(payload, account, lang)

  return { account, payload }
}
