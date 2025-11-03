import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;
export const loggerMiddleware = (req, res, next) => {
    const date = Date.now();
    
    res.on("finish", () => {
      const duration = Date.now() - date;
      let userId = "guest";
      let token = null;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
        try {
          const decoded = jwt.verify(token, jwtSecret);
          userId = decoded.id;
        } catch (error) {
          userId = "malformed-token";
        }
      }

      // Special case for Stripe webhook
      if (req.originalUrl.startsWith("/stripe/webhook")) {
        userId = "stripe";
      }

      logger.info("HTTP Request", {
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date(date).toISOString(),
        status: res.statusCode,
        duration: `${duration}ms`,
        userId
      });
    });
    next();
};
