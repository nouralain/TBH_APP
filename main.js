import './src/config.js';
import express from 'express'
import cors from "cors"
import helmet from "helmet"
import { CORS_ORIGINS, IS_PRODUCTION, PORT, TRUST_PROXY } from './src/config.js';
import bootstrapDB from './src/DB/connections.db.js';
import globalErrorHandler from './src/lib/middlewares/error.middleware.js';
import { byIp, rateLimit } from './src/lib/middlewares/rateLimit.middleware.js';
import { logger } from './src/lib/utils/logger.js';
import { getLang } from './src/lib/utils/getLanguage.js';
import { tc } from './src/lib/utils/translate.js';
import { ForbiddenException } from './src/pkg/errors/error.exception.js';
import { authRouter } from './src/modules/auth/index.js';
import { userRouter } from './src/modules/user/index.js';
import { messageRouter } from './src/modules/message/index.js';

const app = express()
// behind a proxy req.ip would be the proxy's address -> set TRUST_PROXY (e.g. 1) when deployed
if (TRUST_PROXY) app.set("trust proxy", TRUST_PROXY === "true" ? true : Number(TRUST_PROXY) || TRUST_PROXY)

// E3: security headers (no X-Powered-By, nosniff, frameguard, HSTS ...)
app.use(helmet())

// E3: only the frontend origin(s) from CORS_ORIGINS may call the API from a browser.
// requests without an Origin header (Postman, curl, server to server) aren't affected by CORS.
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true)
    if (!CORS_ORIGINS.length && !IS_PRODUCTION) return callback(null, true)
    callback(new ForbiddenException(tc("CORS_NOT_ALLOWED")))
  },
  allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  exposedHeaders: ["Retry-After", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
}
if (IS_PRODUCTION && !CORS_ORIGINS.length) logger.warn("CORS_ORIGINS is empty: browsers on other origins can't call the API")

// C1: no request body is bigger than a 1000-char message, so 10kb is plenty
app.use(cors(corsOptions), express.json({ limit: "10kb" }))

await bootstrapDB()

// D2: global fallback, 100 requests / minute per IP on every route (fails open if Redis is down)
app.use(rateLimit({ keyPrefix: "global", windowSec: 60, max: 100, keyBy: byIp }))

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/messages", messageRouter)
// Catch-all for unknown routes (must come after every router).
app.use((req, res) => res.status(404).json({ status: "fail", message: tc("ROUTE_NOT_FOUND", getLang(req)) }))
app.use(globalErrorHandler)

// Listen only once the DB is connected and every route is mounted.
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
