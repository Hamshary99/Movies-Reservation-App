import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";

import * as onlinePayment from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";

export const deleteBookingTicket = async (bookingId, userId) => {
  try {
    if (!bookingId) {
      throw new ApiError("Booking ID is required", 400);
    }
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    let booking = await bookingRepository.getBookingById(bookingId, userId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this booking" });
    }
    // Check if booking is used
    
    // 24h policy
    const showtime = await showtimeRepository.getShowtimeById(booking.showtimeId);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }

    if (new Date(showtime.date) - new Date() < 24 * 60 * 60 * 1000) {
      throw new ApiError("Cannot delete booking 24h before showtime", 400);
    }

    const refund = await onlinePayment.refundPayment(booking.paymentId, booking);
    console.log("refund: ", refund);
    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete booking",
      error.statusCode || 500
    );
  }
};
