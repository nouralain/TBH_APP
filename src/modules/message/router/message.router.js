import { Router } from "express";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { authentication, optionalAuthentication } from "../../../lib/middlewares/authentication.middleware.js";
import * as validators from "../schema/createMessageSchema.js";
import * as controller from "../controller/message.controller.js";

const router = Router()

// Guests and logged-in users share one endpoint.
router.post("/", optionalAuthentication(), validation(validators.createMessageSchema), controller.createMessage)

router.use(authentication());

// Static paths must be declared before "/:noteId" and "/:id", otherwise the param routes swallow them.
router.get("/", validation(validators.getAllMessagesSchema), controller.getAllMessages);
router.get("/paginate-sort", validation(validators.paginateMessagesSchema), controller.paginateMessages);
router.get("/note-by-content", validation(validators.getMessagesByContentSchema), controller.getMessagesByContent);
router.patch("/all", validation(validators.updateAllTitlesSchema), controller.updateAllTitles);
router.put("/replace/:noteId", validation(validators.replaceMessageSchema), controller.replaceMessage);

router.get("/:id", validation(validators.getMessageSchema), controller.getMessage);
router.patch("/:noteId", validation(validators.updateMessageSchema), controller.updateMessage);
router.delete("/:noteId", validation(validators.deleteMessageSchema), controller.deleteMessage);

export default router
