import redis from "redis";
import logger from "./logger";

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Handle connection errors
redisClient.on("error", (err) => {
  logger.error("Redis connection error", { message: err.message, stack: err.stack });
});

// Handle successful connection
redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

// Connect safely
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("Failed to connect to Redis", { message: err.message, stack: err.stack });
  }
})();

export default redisClient;