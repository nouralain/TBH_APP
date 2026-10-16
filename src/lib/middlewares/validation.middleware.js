import { BadRequestException } from "../../pkg/errors/error.exception.js";
import { getLang } from "../utils/getLanguage.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const lang = getLang(req);

    const validationResult = schema(lang).safeParse(req.body);

    if (!validationResult.success) {
      console.log(validationResult.error.issues);
      return next(new BadRequestException("Validation Error", validationResult.error.issues));
    }

    req.validate = validationResult.data;
    next();
  };
};