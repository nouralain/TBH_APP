// Base Application Exception
export class ApplicationException extends Error {
  constructor(message = "Internal Server Error", statusCode = 500, cause = null) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestException extends ApplicationException {
  constructor(message = "Bad Request", cause = null) {
    super(message, 400, cause);
  }
}

// 401 Unauthorized
export class UnauthorizedException extends ApplicationException {
  constructor(message = "Unauthorized access", cause = null) {
    super(message, 401, cause);
  }
}

// 403 Forbidden
export class ForbiddenException extends ApplicationException {
  constructor(message = "Forbidden action", cause = null) {
    super(message, 403, cause);
  }
}

// 404 Not Found
export class NotFoundException extends ApplicationException {
  constructor(message = "Resource not found", cause = null) {
    super(message, 404, cause);
  }
}

// 409 Conflict
export class ConflictException extends ApplicationException {
  constructor(message = "Conflict occurred", cause = null) {
    super(message, 409, cause);
  }
}

// 422 Unprocessable Entity (Validation)
export class UnprocessableEntityException extends ApplicationException {
  constructor(message = "Validation failed", cause = null) {
    super(message, 422, cause);
  }
}

// 500 Internal Server Error
export class InternalServerErrorException extends ApplicationException {
  constructor(message = "Internal server error", cause = null) {
    super(message, 500, cause);
  }
}

export class WrongCredintials extends ApplicationException {
  constructor(message = "Wrong credintials", cause = null) {
    super(message, 400, cause);
  }
}