import './src/config.js';
import express from 'express'
import cors from "cors"
import { PORT } from './src/config.js';
import bootstrapDB from './src/DB/connections.db.js';
import globalErrorHandler from './src/lib/middlewares/error.middleware.js';
import { authRouter } from './src/modules/auth/index.js';
import { userRouter } from './src/modules/user/index.js';
import { messageRouter } from './src/modules/message/index.js';

const app = express()
app.use(cors(), express.json())

await bootstrapDB()

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/messages", messageRouter)
// Catch-all for unknown routes (must come after every router).
app.use((req, res) => res.status(404).json({ status: "fail", message: "Invalid application routing" }))
app.use(globalErrorHandler)

// Listen only once the DB is connected and every route is mounted.
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
