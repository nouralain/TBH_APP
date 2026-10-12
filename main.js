
import './src/config.js';
import express from 'express' 
import bootstrapDB from './src/DB/connections.db.js';
import globalErrorHandler from './src/lib/middlewares/error.middleware.js';
import { authRouter } from './src/modules/auth/index.js';
import { userRouter } from './src/modules/user/index.js';
const app = express()

app.use(express.json())
bootstrapDB(app)
app.use("/api/auth",authRouter)
app.use("/api/users",userRouter)
app.use(globalErrorHandler)