import { Router } from "express";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { authentication, optionalAuthentication } from "../../../lib/middlewares/authentication.middleware.js";
import { rateLimit } from "../../../lib/middlewares/rateLimit.middleware.js";
import * as validators from "../schema/createMessageSchema.js";
import * as controller from "../controller/message.controller.js";

const router = Router()

// D2: guests 5 / 10 min per IP, logged-in users 20 / 10 min per account
// (after optionalAuthentication so req.user is known; fails open if Redis is down)
const sendLimit = rateLimit({ keyPrefix: "msg-send", windowSec: 10 * 60, max: (req) => (req.user ? 20 : 5) })

// Guests and logged-in users share one endpoint.
// (the 3 / hour per receiver limit is in createMessageService, once the receiver is resolved)
router.post("/", optionalAuthentication(), sendLimit, validation(validators.createMessageSchema), controller.createMessage)

router.use(authentication());

// NOTE: no PATCH /:noteId, PUT /replace/:noteId or PATCH /all anymore -> messages can't be edited (B5)

// Static paths must be declared before "/:id", otherwise the param route swallows them.
router.get("/", validation(validators.getAllMessagesSchema), controller.getAllMessages);
router.get("/paginate-sort", validation(validators.paginateMessagesSchema), controller.paginateMessages);
router.get("/note-by-content", validation(validators.getMessagesByContentSchema), controller.getMessagesByContent);

router.get("/:id", validation(validators.getMessageSchema), controller.getMessage);
router.delete("/:noteId", validation(validators.deleteMessageSchema), controller.deleteMessage);

// receiver blocks / unblocks whoever sent this message (without finding out who it is)
router.post("/:noteId/block-sender", validation(validators.blockSenderSchema), controller.blockSender);
router.delete("/:noteId/block-sender", validation(validators.blockSenderSchema), controller.unblockSender);

// receiver reports a message (C5)
router.post("/:noteId/report", validation(validators.reportMessageSchema), controller.reportMessage);

export default router
