import { BadRequestException } from "../../pkg/errors/error.exception.js";
import { getLang } from "../utils/getLanguage.js";

/**
 * Validates body, query and params in one pass.
 * The schema factory receives the request language and returns a z.object
 * whose keys are any of: body, query, params.
 *
 * Express 5 leaves req.body undefined on requests without a JSON body (GET, DELETE),
 * so we default it to {} instead of rejecting the request.
 */
export const validation = (schema) => {
  return (req, res, next) => {
    const lang = getLang(req);
    const validationResult = schema(lang).safeParse({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
    });

    if (!validationResult.success) {
      return next(new BadRequestException(validationResult.error.issues[0].message, lang));
    }

    req.validate = validationResult.data;
    next();
  };
};
