import { languagesEnum } from "../../../lib/enum/languages.enum.js";
import { getLang } from "../../../lib/utils/getLanguage.js";
import successResponse from "../../../pkg/successResponse.js"
import * as service from "../service/message.service.js"
import { translations } from "../translations.message.js";

export const createMessage = async (req, res) => {
  const lang = getLang(req)
  // req.user is only set when the sender is logged in (optionalAuthentication)
  const data = await service.createMessageService(req.validate.body, req.user?.id, lang)
  successResponse(res, { message: "done", status: 201, data })
}

export const deleteMessage = async (req, res) => {
  const lang = getLang(req);
  await service.deleteService(req.validate.params.noteId, req.user.id, lang);
  successResponse(res, { message: "done", status: 200 });
};

export const blockSender = async (req, res) => {
  const lang = getLang(req);
  await service.blockSenderService(req.validate.params.noteId, req.user.id, lang);
  successResponse(res, { message: lang === languagesEnum.EN ? translations.senderBlocked.EN : translations.senderBlocked.AR });
};

export const unblockSender = async (req, res) => {
  const lang = getLang(req);
  await service.unblockSenderService(req.validate.params.noteId, req.user.id, lang);
  successResponse(res, { message: lang === languagesEnum.EN ? translations.senderUnblocked.EN : translations.senderUnblocked.AR });
};

export const paginateMessages = async (req, res) => {
  const data = await service.paginateService(req.validate.query, req.user.id);
  successResponse(res, { message: "done", data });
};

export const getMessage = async (req, res) => {
  const lang = getLang(req);
  const data = await service.getOneService(req.validate.params.id, req.user.id, lang);
  successResponse(res, { message: "done", data });
};

export const getMessagesByContent = async (req, res) => {
  const data = await service.getByContentService(req.validate.query, req.user.id);
  successResponse(res, { message: "done", data });
};

export const getAllMessages = async (req, res) => {
  const data = await service.getAllService(req.validate.query.type, req.user.id);
  successResponse(res, { message: "done", data });
};
