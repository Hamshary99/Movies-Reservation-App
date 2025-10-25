import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as onlinePayment from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import { cacheWrapper, clearCache } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { promise } from "zod";
import { clear } from "console";
import logger from "../../utils/logger.js";

export const deleteBookingTicket = async (bookingId, userId) => {
  try {
    if (!bookingId) {
      logger.warn("Booking ID is missing in deleteBookingTicket", { bookingId });
      throw new ApiError("Booking ID is required", 400);
    }
    if (!userId) {
      logger.warn("User ID is missing in deleteBookingTicket", { userId });
      throw new ApiError("User ID is required", 400);
    }

    let booking = await bookingRepository.getBookingById(bookingId, userId);
    if (!booking) {
      logger.warn("Booking not found", { bookingId, userId });
      throw new ApiError("Booking not found", 404);
    }
    if (booking.userId !== userId) {
      logger.warn("Unauthorized booking deletion attempt", { userId, bookingId });
      throw new ApiError("You can only delete your own booking", 403);
    }
    // Check if booking is used

    // 24h policy
    const showtime = await showtimeRepository.getShowtimeById(
      booking.showtimeId
    );
    if (!showtime) {
      logger.warn("Showtime not found for booking", { bookingId, showtimeId: booking.showtimeId });
      throw new ApiError("Showtime not found", 404);
    }

    const timeDiff = new Date(showtime.date) - new Date();
    if (timeDiff < 24 * 60 * 60 * 1000) {
      logger.warn("Attempt to delete booking less than 24 hours before showtime", { bookingId, userId, showtimeId: showtime.id });
      throw new ApiError(
        "Cannot delete booking less than 24 hours before showtime",
        400
      );
    }

    logger.info("Refunding booking", { bookingId, userId });
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
    logger.error("Error in deleteBookingTicket", { bookingId, userId, message: error.message, stack: error.stack });
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete booking",
      error.statusCode || 500,
      error
    );
  }
};
