export class StripeError extends Error {
  constructor(message, statusCode, type = "stripe_error") {
    super(message);
    this.statusCode = statusCode;
    this.name = "StripeError";
    this.type = type;
  }
}
export class ApiError extends Error {
  constructor(message, statusCode, type = "api_error") {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    this.type = type;
  }
}

export const handleError = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      type: "api_error",
      message: err.message,
      statusCode: err.statusCode,
      timeStamp: new Date().toISOString(),
    });
  }
  if (err instanceof StripeError) {
    return res.status(err.statusCode).json({
      type: err.type,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      timeStamp: new Date().toISOString(),
    });
  }
  return res.status(err.statusCode || 500).json({
    type: "unexpected_error",
    message: err.message || "Unexpected error",
    statusCode: err.statusCode || 500,
    timeStamp: new Date().toISOString(),
  });
};
