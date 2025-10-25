import logger from "../../utils/logger.js";
import { checkoutPayment } from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import { db } from "../../repository/dbConfig.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as userRepository from "../../repository/userRepository.js";
import { cacheWrapper, clearCache, clearCachePattern } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { redisClient } from "../../utils/redis.js";

export const postBookingTicket = async (data, userId) => {
  const context = {userId, showtimeId: data?.showtimeId, seatId: data?.seatId};
  try {
    if (!userId) throw new ApiError("User ID is required", 400);
    if (!data || !data.showtimeId || !data.seatId)
      throw new ApiError("Booking data is required", 400);

    const { showtimeId, seatId } = data;
    if (!showtimeId || !seatId)
      throw new ApiError("Showtime ID and Seat ID are required", 400);

    const showtime = await cacheWrapper(
      cacheKeys.showtime(showtimeId),
      async () => {
        const dbShowtime = await showtimeRepository.getShowtimeById(showtimeId);
        if (!dbShowtime) throw new ApiError("Showtime not found", 404);
        return dbShowtime;
      }
    );

    const user = await cacheWrapper(cacheKeys.user(userId), async () => {
      const dbUser = await userRepository.getUserById(userId);
      if (!dbUser) throw new ApiError("User not found", 404);
      return dbUser;
    });
    logger.info("Starting booking transaction", context);

    const result = await db.transaction(async (tx) => {
      logger.debug("Checking seat availability", { ...context, seatId });
      const isSeatAvailableForShowtime =
        await bookingRepository.checkSeatAvailability(showtimeId, seatId);
      if (!isSeatAvailableForShowtime) {
        logger.warn("Seat already reserved or unavailable", { ...context, seatId });
        throw new ApiError("One or more seats are already reserved", 400);
      }

      let newBooking = await bookingRepository.createBooking(
        userId,
        showtimeId,
        seatId,
        showtime.price
      );
      if (!newBooking) throw new ApiError("Failed to create booking", 500);
      logger.info("Created booking:", { ...context, bookingId: newBooking.id });

      const payment = await checkoutPayment(
        newBooking,
        seatId,
        showtimeId,
        user
      );
      newBooking = await bookingRepository.addPaymentId(
        newBooking.id,
        payment.id
      );
      if (!newBooking) throw new ApiError("Failed to add payment ID", 500);
      logger.info("Added payment ID and awaiting for payment", { ...context, bookingId: newBooking.id });

      return { booking: newBooking, seats: seatId, paymentUrl: payment.url };
    });

    await Promise.all([
      clearCache(cacheKeys.userBookings(userId)),
      clearCache(cacheKeys.allBookings()),
      clearCache(cacheKeys.availableSeats(showtimeId)),
    ]);
    logger.debug("Cleared booking caches and stale data", context);

    return result;
  } catch (error) {
    logger.error("Booking insertion error:", { message: error.message, stack: error.stack, ...context });
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to post booking",
      error.statusCode || 500,
      error
    );
  }
};
