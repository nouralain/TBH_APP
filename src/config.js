import { config } from "dotenv"
import { resolve } from "node:path"

const NODE_ENV = process.env.NODE_ENV ?? "development"
config({path:resolve(`.env.${NODE_ENV}`)})
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
