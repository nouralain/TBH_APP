import { Router } from "express";
import { authenticate } from "../../common/middlewares/auth.middlware.js";
import { findByEmail, findById, update } from "./user.controller.js";
const router = Router()

router.patch("/:id",authenticate,update)
router.get("/by-email",findByEmail)
router.get("/:id",findById)

export default router