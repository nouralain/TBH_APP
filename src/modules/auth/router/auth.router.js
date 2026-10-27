import { Router } from "express";
import {  login, register ,confirmOtp,resendOtp} from "../controller/auth.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { signupSchema } from "../schema/signupSchema.js";
import { loginSchema } from "../schema/loginSchema.js";
import { confirmOtpSchema, resendOtpSchema } from "../schema/confirmOtpSchema.js";
const router = Router()

router.post("/register",validation(signupSchema),register)
router.post("/login",validation(loginSchema),login)
router.post("/confirm-otp",validation(confirmOtpSchema),confirmOtp)
router.post("/resend-otp",validation(resendOtpSchema),resendOtp)

export default router