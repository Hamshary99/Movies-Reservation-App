import logger from "./logger.js";
import { randomUUID } from "crypto";

export class StripeError extends Error {
  constructor(message, statusCode, type = "stripe_error", cause = null) {
    try {
      super(message, { cause });
    } catch {
      super(message);
    }
    this.statusCode = statusCode;
    this.name = "StripeError";
    this.type = type;
    if (cause?.stack) this.stack += `\nCaused by: ${cause.stack}`;
  }
}
export class ApiError extends Error {
  constructor(
    message,
    statusCode,
    type = "api_error",
    cause = null,
    details = null
  ) {
    try {
      super(message, { cause });
    } catch (error) {
      super(message);
    }
    this.statusCode = statusCode || 500;
    this.name = "ApiError";
    this.type = type;
    this.details = details;

    if (cause?.stack) {
      this.stack = `${this.stack || ""}\nCaused by: ${cause.stack}`;
    }
  }
}

export class SQLError extends Error {
  constructor(message, statusCode, type = "SQL_error", cause = null) {
    try {
      super(message, { cause });
    } catch (error) {
      super(message);
    }
    this.statusCode = statusCode;
    this.name = "SQLError";
    this.type = type;
    if (cause?.stack) {
      this.stack = `${this.stack || ""}\nCaused by: ${cause.stack}`;
    }
  }
}

const logError = (type, err, req, requestId) => {
  logger.error(`${type}`, {
    requestId,
    message: err.message,
    stack: err.stack,
    cause: err.cause?.message,
    causeStack: err.cause?.stack,
    statusCode: err.statusCode || 500,
    method: req.method || "unknown_method",
    url: req.originalUrl || req.url || "unknown_url",
    userId: req.user?.id || "guest",
    env: process.env.NODE_ENV || "development",
    type: err.type || "unknown_error",
  });
};

export const handleError = (err, req, res, next) => {
  if (res.headersSent) return next(err); // avoid double response
  const requestId = randomUUID();
  const statusCode = err.statusCode || 500;
  const errorType =
    err instanceof ApiError
      ? "API Error"
      : err instanceof StripeError
        ? "Stripe Error"
        : err instanceof SQLError
          ? "SQL Error"
          : "Unexpected Error";

  logError(errorType, err, req, requestId);

  const response = {
    status: "error",
    type: errorType || "unexpected_error",
    message: err.message || "Unexpected error",
    statusCode,
    cause: err.cause ? err.cause.message : null,
    stack: err.stack,
    timeStamp: new Date().toISOString(),
  };

  if (err.details) response.details = err.details;
  if (err.fieldErrors) response.fieldErrors = err.fieldErrors;
  if (err.code) response.code = err.code;

  res.status(statusCode).json(response);
};
