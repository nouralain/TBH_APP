import { Router } from "express";
import {  login, register ,confirmOtp,resendOtp , signUpWithGoogle} from "../controller/auth.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { byIp, rateLimit, requireRedis } from "../../../lib/middlewares/rateLimit.middleware.js";
import { googleSignupSchema, signupSchema } from "../schema/signupSchema.js";
import { loginSchema } from "../schema/loginSchema.js";
import { confirmOtpSchema, resendOtpSchema } from "../schema/confirmOtpSchema.js";
const router = Router()

const HOUR = 60 * 60

// D2: registering / resending sends an email -> 5 per hour per IP.
// failClosed: no Redis = no limit = free email spam, so 503 instead (D4)
const registerLimit = rateLimit({ keyPrefix: "register", windowSec: HOUR, max: 5, keyBy: byIp, failClosed: true })
const resendOtpLimit = rateLimit({ keyPrefix: "resend-otp", windowSec: HOUR, max: 5, keyBy: byIp, failClosed: true })
const googleLimit = rateLimit({ keyPrefix: "google", windowSec: 15 * 60, max: 20, keyBy: byIp, failClosed: true })

// D4: every auth service keeps its state in Redis (signup session, OTP, login lock)
router.use(requireRedis())

// login (IP + email lock) and confirm-otp (wrong tries per email) are limited inside their services (D2/D3)
router.post("/register",registerLimit,validation(signupSchema),register)
router.post("/login",validation(loginSchema),login)
router.post("/signup-with-google",googleLimit,validation(googleSignupSchema),signUpWithGoogle)
router.post("/confirm-otp",validation(confirmOtpSchema),confirmOtp)
router.post("/resend-otp",resendOtpLimit,validation(resendOtpSchema),resendOtp)

export default router
