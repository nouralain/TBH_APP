import { Router } from "express";
import {  login, register } from "../controller/auth.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { signupSchema } from "../schema/signupSchema.js";
import { loginSchema } from "../schema/loginSchema.js";
const router = Router()

router.post("/register",validation(signupSchema),register)
router.post("/login",validation(loginSchema),login)

export default router