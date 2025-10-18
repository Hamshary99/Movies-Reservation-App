import redis from "redis";

export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Handle connection errors
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

// Handle successful connection
redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

// Connect safely
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

export default redisClient;