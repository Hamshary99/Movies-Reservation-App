import { bookingModel } from "../../models/bookingModel.js";
import { userModel } from "../../models/userModel.js";
import { showtimeModel } from "../../models/showtimeModel.js";
// import {
//   createPaymentIntent,
//   refundPaymentIntent,
// } from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";

export const updateProfile = async (id, data, userId, userRole) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }

    let targetId = userId;
    if (userRole === "admin" && id) {
      targetId = id;
    } else if (id && id !== userId.toString()) {
      throw new ApiError("You can only update your own profile", 403);
    }

    const fieldsToUpdate = {};
    if (data.name) fieldsToUpdate.name = data.name;
    if (data.email) fieldsToUpdate.email = data.email;
    if (data.phone) fieldsToUpdate.phone = data.phone;

    // Best practice to skip the password validation and requiring it from the user
    const user = await userModel
      .findByIdAndUpdate(targetId, fieldsToUpdate, {
        new: true,
        runValidators: true,
      })
      .select("-password -__v");
    if (!user) {
      throw new ApiError("User is not found", 404);
    }
    return user;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to update profile",
      error.statusCode || 500
    );
  }
};

export const updateBooking = async (id, data, userId) => {
  try {
    if (!id) {
      throw new ApiError("Booking ID is required", 400);
    }
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }
    const { showtimeId, seatId } = data;

    const booking = await bookingModel.findById(id);
    if (!booking) {
      throw new ApiError("Booking is not found", 404);
    }

    if (booking.user.toString() !== userId.toString()) {
      throw new ApiError(
        "You do not have permission to update this booking",
        403
      );
    }
    if (booking.isUsed) {
      throw new ApiError("Ticket has already been used", 400);
    }

    //24h policy
    const showtime = await showtimeModel.findById(booking.showtime);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    if (new Date(showtime.date) - new Date() < 24 * 60 * 60 * 1000) {
      throw new ApiError("Cannot update booking 24h before showtime", 400);
    }

    booking.showtime = showtimeId;
    booking.seats = seatId;
    await booking.save();

    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to update booking",
      error.statusCode || 500
    );
  }
};
