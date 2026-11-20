import { Router } from "express";
import { authentication } from "../../../lib/middlewares/authentication.middleware.js";
import { deleteController, profileController,UpdateController ,rotateTokenController, publicProfileController, unblockAllController, logoutController} from "../controller/user.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { logoutSchema, publicProfileSchema, updateSchema } from "../schema/updateSchema.js";
import { tokenTypeEnum } from "../../../lib/enum/tokenType.enum.js";

const router = Router()

// public (no authentication) -> used by the share link page to show "send a message to Nour"
router.get("/public/:username",validation(publicProfileSchema),publicProfileController)

router.get("/profile",authentication(),profileController)
router.delete("/blocked",authentication(),unblockAllController)
router.delete("/",authentication(),deleteController)
router.patch("/",authentication(),validation(updateSchema),UpdateController)
router.post("/rotate-token",authentication({tokenType:tokenTypeEnum.REFRESH}),rotateTokenController)
// E5: ends this session, or every session with { "allDevices": true }
router.post("/logout",authentication(),validation(logoutSchema),logoutController)
export default router
