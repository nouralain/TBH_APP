import { Router } from "express";
import { createMessage } from "../controller/message.controller.js";
import { validation } from "../../../lib/middlewares/validation.middleware.js";
import { createMessageSchema } from "../schema/createMessageSchema.js";
import { authentication } from "../../../lib/middlewares/authentication.middleware.js";
import { UnauthorizedException } from "../../../pkg/errors/error.exception.js";
import { decodeToken } from "../../../pkg/security/token.security.js";
import { tokenTypeEnum } from "../../../lib/enum/tokenType.enum.js";
import * as validators from "../schema/createMessageSchema.js";
import * as controller from "../controller/message.controller.js";

const router = Router()

router.post("/" ,async(req,res,next)=>{
    if(req.headers.authorization){
        const { authorization } = req.headers;
        if (!authorization) {
            throw new UnauthorizedException(null, lang);
        }
        
        const {account , payload} = await decodeToken({ authorization, tokenType:tokenTypeEnum.ACCESS });
        req.user = account
        req.payload = payload
          }
next()
}, validation(createMessageSchema) , createMessage)

router.use(authentication());
router.get("/", validation(validators.getAllMessagesSchema), controller.getAllMessages);

router.get("/paginate-sort", validation(validators.paginateMessagesSchema), controller.paginateMessages);
router.get("/note-by-content", validation(validators.getMessagesByContentSchema), controller.getMessagesByContent);
router.patch("/all", validation(validators.updateAllTitlesSchema), controller.updateAllTitles);
router.put("/replace/:noteId", validation(validators.replaceMessageSchema), controller.replaceMessage);

router.patch("/:noteId", validation(validators.updateMessageSchema), controller.updateMessage);
router.delete("/:noteId", validation(validators.deleteMessageSchema), controller.deleteMessage);
router.get("/:id", validation(validators.getMessageSchema), controller.getMessage);

export default router
