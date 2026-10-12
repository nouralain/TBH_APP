import { BadRequestException } from "../../pkg/error.exception.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(validationResult.error.issues);
      return next(new BadRequestException("Validation Error", validationResult.error.issues));
    }

    req.validate = validationResult.data;
    next();
  };
};