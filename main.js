
import './src/config.js';
import express from 'express' 
import bootstrapDB from './src/DB/connections.db.js';
import globalErrorHandler from './src/lib/middlewares/error.middleware.js';
import { authRouter } from './src/modules/auth/index.js';
import { userRouter } from './src/modules/user/index.js';
import cors from "cors"
const app = express()
app.use(cors(),express.json())
await bootstrapDB(app)

app.use("/api/auth",authRouter)
app.use("/api/users",userRouter)
app.all("{/dummy}",(req,res)=>res.status(404).send("Invalid application routing"))
app.use(globalErrorHandler)

