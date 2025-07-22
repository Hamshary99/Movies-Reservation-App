import { bookingModel } from "../../models/bookingModel.js";
import { showtimeModel } from "../../models/showtimeModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const deleteBookingTicket = async (id, userId) => {
  try {
    if (!id) {
      throw new ApiError("Booking ID is required", 400);
    }
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    let booking = await bookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this booking" });
    }
    if (booking.isUsed) {
      return res.status(400).json({ message: "Ticket has already been used" });
    }
      
    // 72h policy
    const showtime = await showtimeModel.findById(booking.showtime);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }
    if (new Date(showtime.date) - new Date() < 72 * 60 * 60 * 1000) {
        throw new ApiError("Cannot delete booking 72h before showtime", 400);
    }

    booking = await bookingModel.findByIdAndDelete(id);
    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete booking",
      error.statusCode || 500
    );
  }
};
