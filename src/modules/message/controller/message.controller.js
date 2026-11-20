import { getLang } from "../../../lib/utils/getLanguage.js";
import successResponse from "../../../pkg/successResponse.js"
import * as service from "../service/message.service.js"

export const createMessage = async (req, res) => {
  const lang = getLang(req)
  // req.user is only set when the sender is logged in (optionalAuthentication)
  const data = await service.createMessageService(req.validate.body, req.user?.id, lang)
  successResponse(res, { message: "done", status: 201, data })
}

export const updateMessage = async (req, res) => {
  const lang = getLang(req);
  const data = await service.updateService(req.validate.params.noteId, req.validate.body, req.user.id, lang);
  successResponse(res, { message: "done", data });
};

export const replaceMessage = async (req, res) => {
  const lang = getLang(req);
  const data = await service.replaceService(req.validate.params.noteId, req.validate.body, req.user.id, lang);
  successResponse(res, { message: "done", data });
};

export const updateAllTitles = async (req, res) => {
  const data = await service.updateAllTitlesService(req.validate.body.title, req.user.id);
  successResponse(res, { message: "done", data });
};

export const deleteMessage = async (req, res) => {
  const lang = getLang(req);
  await service.deleteService(req.validate.params.noteId, req.user.id, lang);
  successResponse(res, { message: "done", status: 200 });
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
