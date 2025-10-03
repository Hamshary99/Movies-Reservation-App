import { checkoutPayment } from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import {db} from "../../repository/dbConfig.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as userRepository from "../../repository/userRepository.js";

export const postBookingTicket = async (data, id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }

    if (!data || !data.showtimeId || !data.seatId) {
      throw new ApiError("Booking data is required", 400);
    }
    const { showtimeId, seatId } = data;

    if (!showtimeId || !seatId) {
      throw new ApiError("Showtime ID and Seat ID are required", 400);
    }

    return db.transaction(async (tx) => {
      const isSeatAvailableForShowtime = await bookingRepository.checkSeatAvailability(
        showtimeId,
        seatId
      );

      if (!isSeatAvailableForShowtime) {
        throw new ApiError("One or more seats are already reserved", 400);
      };

      const showtime = await showtimeRepository.getShowtimeById(showtimeId);
      if (!showtime) {
        throw new ApiError("Showtime not found", 404);
      }

      const newBooking = await bookingRepository.createBooking(
        id,
        showtimeId,
        seatId,
        showtime.price,
      );

      if (!newBooking) {
        throw new ApiError("Failed to create booking", 500);
      }

      const user = await userRepository.getUserById(id);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const payment = await checkoutPayment(newBooking, seatId, showtimeId, user);

      return { booking: newBooking, seats: seatId, paymentUrl: payment.url };

    });

  } catch (error) {
    throw new ApiError(
      error.message || "Failed to post booking",
      error.statusCode || 500
    );
  }
};

