import { config } from "dotenv"
import { resolve } from "node:path"

const NODE_ENV = process.env.NODE_ENV ?? "development"
config({path:resolve(`.env.${NODE_ENV}`)})
export const PORT = parseInt(process.env.PORT ?? "3000");
export const JWT_SECRET= process.env.JWT_SECRET
export const DB_URI = process.env.DB_URI
export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH =Number( process.env.IV_LENGTH)
export const ENC_ALGORITHM = process.env.ENC_ALGORITHM
export const ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE