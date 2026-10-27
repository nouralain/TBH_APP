import { BadRequestException } from "../../pkg/errors/error.exception.js";
import { languagesEnum } from "../enum/languages.enum.js";
import { getLang } from "../utils/getLanguage.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const lang = getLang(req);
    if (!req.body) throw new BadRequestException(lang === languagesEnum.AR ? "بيانات الطلب مطلوبة" : "Request body is required");
    const validationResult = schema(lang).safeParse(req.body);

    if (!validationResult.success) {
      return next(new BadRequestException( validationResult.error.issues[0].message,lang));
    }

    req.validate = validationResult.data;
    next();
  };
};