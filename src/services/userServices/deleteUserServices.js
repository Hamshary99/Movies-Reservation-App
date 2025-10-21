import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as onlinePayment from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import { cacheWrapper, clearCache } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { promise } from "zod";
import { clear } from "console";

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
      throw new ApiError("Booking not found", 404);
    }
    if (booking.userId !== userId) {
      throw new ApiError("You can only delete your own booking", 403);
    }
    // Check if booking is used

    // 24h policy
    const showtime = await showtimeRepository.getShowtimeById(
      booking.showtimeId
    );
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }

    const timeDiff = new Date(showtime.date) - new Date();
    if (timeDiff < 24 * 60 * 60 * 1000) {
      throw new ApiError(
        "Cannot delete booking less than 24 hours before showtime",
        400
      );
    }
    const refund = await onlinePayment.refundPayment(
      booking.paymentId,
      booking
    );

    await Promise.all([
      clearCache(cacheKeys.booking(userId, bookingId)),
      clearCache(cacheKeys.userBookings(userId)),
      clearCache(cacheKeys.allBookings()),
    ]);
    return booking;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete booking",
      error.statusCode || 500
    );
  }
};
