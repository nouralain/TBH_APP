import './src/config.js';
import express from 'express'
import cors from "cors"
import { PORT, TRUST_PROXY } from './src/config.js';
import bootstrapDB from './src/DB/connections.db.js';
import globalErrorHandler from './src/lib/middlewares/error.middleware.js';
import { authRouter } from './src/modules/auth/index.js';
import { userRouter } from './src/modules/user/index.js';
import { messageRouter } from './src/modules/message/index.js';

const app = express()
// behind a proxy req.ip would be the proxy's address -> set TRUST_PROXY (e.g. 1) when deployed
if (TRUST_PROXY) app.set("trust proxy", TRUST_PROXY === "true" ? true : Number(TRUST_PROXY) || TRUST_PROXY)
// C1: no request body is bigger than a 1000-char message, so 10kb is plenty
app.use(cors(), express.json({ limit: "10kb" }))

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
