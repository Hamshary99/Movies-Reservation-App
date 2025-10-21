import { redisClient } from "./redis.js";

const DEFAULT_TTL = 600; // 10 minutes

export const cacheWrapper = async (key, cb, ttl = DEFAULT_TTL) => {
  try {
    if (redisClient?.isOpen) {
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`Cache hit → ${key}`);
        return JSON.parse(cached);
      }
    }

    console.log(`Cache miss → ${key}`);
    const data = await cb();

    if (data && redisClient?.isOpen) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error(`Cache error for ${key}:`, err);
    throw err;
  }
};

// If update or delete occured, we must clear the said cache
export const clearCache = async (key) => {
  if (redisClient?.isOpen) await redisClient.del(key);
};