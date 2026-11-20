import { config } from "dotenv"
import { resolve } from "node:path"

const ENV = process.env.NODE_ENV ?? "development"
config({path:resolve(`.env.${ENV}`)})
export const PORT = parseInt(process.env.PORT ?? "3000");
export const DB_URI = process.env.DB_URI
export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH =Number( process.env.IV_LENGTH)
export const ENC_ALGORITHM = process.env.ENC_ALGORITHM
export const ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE
export const ACCESS_TOKEN_EXPIRY = Number(process.env.ACCESS_TOKEN_EXPIRY)
export const REFRESH_TOKEN_SIGNATURE = process.env.REFRESH_TOKEN_SIGNATURE
export const REFRESH_TOKEN_EXPIRY = Number(process.env.REFRESH_TOKEN_EXPIRY)
export const MAILER_PASSKEY = process.env.MAILER_PASSKEY
export const MAILER_EMAIL = process.env.MAILER_EMAIL
export const APP_NAME = process.env.APP_NAME
export const REDIS_URL = process.env.REDIS_URL
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID
// C6: secret used to HMAC guest IPs (so blocked guests can be recognised without storing their IP).
// falls back to the access token secret so the app still starts, but set your own in production.
export const IP_HASH_SECRET = process.env.IP_HASH_SECRET ?? process.env.ACCESS_TOKEN_SIGNATURE
// how many proxies sit in front of the app (e.g. "1" behind nginx / a PaaS router).
// leave empty locally -> req.ip is the socket address.
export const TRUST_PROXY = process.env.TRUST_PROXY
export const NODE_ENV = process.env.NODE_ENV ?? "development"
export const IS_PRODUCTION = NODE_ENV === "production"
// E3: comma-separated list of frontend origins allowed by CORS, ex: "http://localhost:4200,https://tbh.app"
// empty -> every origin is allowed in development, none (only same-origin / no-origin tools like Postman) in production
export const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean)
