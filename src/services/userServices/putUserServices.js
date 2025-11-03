import * as userRepository from "../../repository/userRepository.js"
import { ApiError } from "../../utils/errorHandler.js";
import { cacheWrapper, clearCache, clearCachePattern } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { promise } from "zod";
import logger from "../../utils/logger.js";

export const updateProfile = async (userId, data, selectedUserId, userRole) => {
  try {
    if (!userId) {
      logger.warn("User ID is missing in updateProfile", { userId });
      throw new ApiError("User ID is required", 400);
    }

    let targetId = userId;
    if ((userRole === "admin") || selectedUserId === userId) {
      targetId = selectedUserId;
    } else if (targetId !== userId) {
      logger.warn("Unauthorized profile update attempt", { userId, targetId });
      throw new ApiError("You can only update your own profile", 403);
    }


    const fieldsToUpdate = {};
    if (data.name) fieldsToUpdate.name = data.name;
    if (data.email) fieldsToUpdate.email = data.email;
    if (data.phone) fieldsToUpdate.phone = data.phone;

    logger.debug("Updating user profile", { userId: targetId, fields: Object.keys(fieldsToUpdate) });
    const user = await userRepository.userUpdateProfile(targetId, data);

    await Promise.all([
      clearCache(cacheKeys.user(targetId)),
      clearCache(cacheKeys.userBookings(targetId)),
      clearCachePattern(cacheKeys.booking("*", targetId)),
    ])
    return user;
  } catch (error) {
    logger.error("Error in updateProfile", { userId, message: error.message, stack: error.stack });
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to update profile",
      error.statusCode || 500,
      error
    );
  }
};
