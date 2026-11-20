import mongoose from "mongoose";
import { IS_PRODUCTION } from "../../config.js";
import { ApplicationException } from "../../pkg/errors/error.exception.js";
import { errorTranslation } from "../../pkg/errors/translations.errors.js";
import { getLang } from "../utils/getLanguage.js";
import { describeError, logger } from "../utils/logger.js";
import { t, tc } from "../utils/translate.js";

const fail = (res, statusCode, body) => res.status(statusCode).json({ status: "fail", ...body });

/**
 * E2: known Mongoose / Mongo errors are the client's fault (bad id, duplicate value, stale write)
 * -> turn them into 4xx instead of a 500. returns null when the error isn't one of them.
 * we never echo the whole Mongo error back: it can contain the query and the stored values.
 */
const mapDatabaseError = (err, lang) => {
  // findById("abc") -> "Cast to ObjectId failed"
  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, error: "CastError", message: tc(err.kind === "ObjectId" ? "INVALID_ID" : "INVALID_VALUE", lang), field: err.path };
  }

  // schema rules (required, maxLength, enum ...) -> first message + every field that failed
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.keys(err.errors ?? {});
    const first = fields.length ? err.errors[fields[0]].message : err.message;
    return { statusCode: 400, error: "ValidationError", message: first, fields };
  }

  // optimisticConcurrency: the document changed between read and save
  if (err instanceof mongoose.Error.VersionError) {
    return { statusCode: 409, error: "VersionError", message: tc("DOCUMENT_CHANGED", lang) };
  }

  // unique index (email, username ...). only the field NAME is returned, not the value
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? err.keyValue ?? {});
    return { statusCode: 409, error: "DuplicateKey", message: tc("DUPLICATE_VALUE", lang), fields };
  }

  return null;
};

const globalErrorHandler = (err, req, res, next) => {
  const lang = getLang(req);

  if (err instanceof ApplicationException) {
    // expected errors (401, 404, 409 ...) are part of normal traffic -> debug only
    logger.debug(`${err.statusCode} ${err.name}: ${err.message}`);
    // 429: tell the client how many seconds to wait (D1)
    if (err.retryAfter > 0) res.set("Retry-After", String(err.retryAfter));

    const body = { error: err.name, message: err.message };
    // a 4xx cause is meant for the client (ex: which field failed); a 5xx one is internal
    if (err.cause !== undefined && (err.statusCode < 500 || !IS_PRODUCTION)) body.cause = err.cause;
    return res.status(err.statusCode).json({ status: err.statusCode < 500 ? "fail" : "error", ...body });
  }

  const mapped = mapDatabaseError(err, lang);
  if (mapped) {
    const { statusCode, ...body } = mapped;
    logger.debug(`${statusCode} ${body.error}: ${body.message}`);
    return fail(res, statusCode, body);
  }

  // errors thrown by express.json(): body too large (413), invalid JSON (400) ...
  // they carry their own 4xx status, they're the client's fault, not a server error
  if (err.type && err.status >= 400 && err.status < 500) {
    return fail(res, err.status, { message: err.message });
  }

  // anything else is a bug -> log it, and in production send no details at all
  logger.error(`${req.method} ${req.originalUrl} failed:`, describeError(err));
  const body = { status: "error", message: t(errorTranslation, "internalServer", lang) };
  if (!IS_PRODUCTION) {
    body.error = err.name;
    body.detail = err.message;
    if (err.cause !== undefined) body.cause = err.cause;
  }
  res.status(500).json(body);
};

export default globalErrorHandler;
