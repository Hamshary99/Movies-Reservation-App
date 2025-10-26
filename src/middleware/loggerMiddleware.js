import logger from "../utils/logger.js";

export const loggerMiddleware = (req, res, next) => {
    const date = Date.now();
    
    res.on("finish", () => {
        const duration = Date.now() - date;
        logger.info("HTTP Request", {
          method: req.method,
          url: req.originalUrl,
          timestamp: new Date(date).toISOString(),
          status: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id || (req.originalUrl.startsWith("/stripe/webhook") ? "stripe" : "guest"),
        });
    });
    next();
};
