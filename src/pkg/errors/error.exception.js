// exceptions.js
import { languagesEnum } from "../../lib/enum/languages.enum.js";
import { errorTranslation } from "./translations.errors.js";

// Base Application Exception
export class ApplicationException extends Error {
  constructor(message, statusCode = 500, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.internalServer[lang] || errorTranslation.internalServer.EN;
    super(message || defaultMsg);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.badRequest[lang] || errorTranslation.badRequest.EN;
    super(message || defaultMsg, 400, lang);
  }
}

// 401 Unauthorized
export class UnauthorizedException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.unauthorized[lang] || errorTranslation.unauthorized.EN;
    super(message || defaultMsg, 401, lang);
  }
}

// 403 Forbidden
export class ForbiddenException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.forbidden[lang] || errorTranslation.forbidden.EN;
    super(message || defaultMsg, 403, lang);
  }
}

// 404 Not Found
export class NotFoundException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.notFound[lang] || errorTranslation.notFound.EN;
    super(message || defaultMsg, 404, lang);
  }
}

// 409 Conflict
export class ConflictException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.conflict[lang] || errorTranslation.conflict.EN;
    super(message || defaultMsg, 409, lang);
  }
}

// 422 Unprocessable Entity (Validation)
export class UnprocessableEntityException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.unprocessableEntity[lang] || errorTranslation.unprocessableEntity.EN;
    super(message || defaultMsg, 422, lang);
  }
}

// 500 Internal Server Error
export class InternalServerErrorException extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.internalServer[lang] || errorTranslation.internalServer.EN;
    super(message || defaultMsg, 500, lang);
  }
}

// Wrong Credentials
export class WrongCredintials extends ApplicationException {
  constructor(message, lang = languagesEnum.EN) {
    const defaultMsg = errorTranslation.wrongCredentials[lang] || errorTranslation.wrongCredentials.EN;
    super(message || defaultMsg, 400, lang);
  }
}