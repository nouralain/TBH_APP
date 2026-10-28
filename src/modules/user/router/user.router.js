import { Router } from "express";
import { authentication } from "../../../lib/middlewares/authentication.middleware.js";
import { deleteController, profileController,UpdateController ,rotateTokenController} from "../controller/user.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { updateSchema } from "../schema/updateSchema.js";
import { tokenTypeEnum } from "../../../lib/enum/tokenType.enum.js";

const router = Router()

router.get("/profile",authentication(),profileController)
router.delete("/",authentication(),deleteController)
router.patch("/",authentication(),validation(updateSchema),UpdateController)
router.post("/rotate-token",authentication({tokenType:tokenTypeEnum.REFRESH}),rotateTokenController)
export default router
