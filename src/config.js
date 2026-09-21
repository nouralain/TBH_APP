import { config } from "dotenv"
import { resolve } from "node:path"

const NODE_ENV = process.env.NODE_ENV ?? "development"
config({path:resolve(`.env.${NODE_ENV}`)})
export const PORT = parseInt(process.env.PORT ?? "3000");
export const JWT_SECRET= process.env.JWT_SECRET
export const DB_URI = process.env.DB_URI