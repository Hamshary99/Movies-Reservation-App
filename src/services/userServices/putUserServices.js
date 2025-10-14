import * as userRepository from "../../repository/userRepository.js"
import { ApiError } from "../../utils/errorHandler.js";

export const updateProfile = async (id, data, userId, userRole) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }

    let targetId = userId;
    if (userRole === "admin" && id) {
      targetId = id;
    } else if (id !== userId) {
      throw new ApiError("You can only update your own profile", 403);
    }


    const fieldsToUpdate = {};
    if (data.name) fieldsToUpdate.name = data.name;
    if (data.email) fieldsToUpdate.email = data.email;
    if (data.phone) fieldsToUpdate.phone = data.phone;

    const user = await userRepository.userUpdateProfile(id, data);
    return user;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to update profile",
      error.statusCode || 500
    );
  }
};
