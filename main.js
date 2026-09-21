import './src/config.js';
import express from 'express' 
import { authRouter } from './src/modules/auth/index.js';
import globalErrorHandler from './src/common/middlewares/error.middleware.js';
import { userRouter } from './src/modules/user/index.js';
import bootstrapDB from './src/DB/connections.db.js';
const app = express()

app.use(express.json())
bootstrapDB(app)
app.use("/auth",authRouter)
app.use("/users",userRouter)
app.use(globalErrorHandler)