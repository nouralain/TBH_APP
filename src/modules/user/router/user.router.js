import { Router } from "express";
import { authentication } from "../../../lib/middlewares/authentication.middleware.js";
import { deleteController, profileController,UpdateController } from "../controller/user.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { updateSchema } from "../schema/updateSchema.js";

const router = Router()

router.get("/profile",authentication,profileController)
router.delete("/",authentication,deleteController)
router.patch("/",authentication,validation(updateSchema),UpdateController)
export default router
