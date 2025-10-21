import { checkoutPayment } from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import { db } from "../../repository/dbConfig.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as userRepository from "../../repository/userRepository.js";
import { cacheWrapper, clearCache } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { redisClient } from "../../utils/redis.js";

export const postBookingTicket = async (data, userId) => {
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

    const result = await db.transaction(async (tx) => {
      const isSeatAvailableForShowtime =
        await bookingRepository.checkSeatAvailability(showtimeId, seatId);
      if (!isSeatAvailableForShowtime)
        throw new ApiError("One or more seats are already reserved", 400);

      let newBooking = await bookingRepository.createBooking(
        userId,
        showtimeId,
        seatId,
        showtime.price
      );
      if (!newBooking) throw new ApiError("Failed to create booking", 500);

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

      return { booking: newBooking, seats: seatId, paymentUrl: payment.url };
    });

    await Promise.all([
      clearCache(cacheKeys.userBookings(userId)),
      clearCache(cacheKeys.allBookings),
      clearCache(cacheKeys.availableSeats(showtimeId)),
    ]);

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to post booking",
      error.statusCode || 500
    );
  }
};
