import { bookingModel } from "../../models/bookingModel.js";
import { seatModel } from "../../models/seatModel.js";
import { userModel } from "../../models/userModel.js";
// import {
//   createClientData,
//   createPaymentIntent
//  } from "../../utils/onlinePayment.js";
import { ApiError } from "../../utils/errorHandler.js";
import { showtimeModel } from "../../models/showtimeModel.js";

export const postBookingTicket = async (data, id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }
    const { showtimeId, seatId } = data;
    // Ensure seatId is always an array
    let seatIds = Array.isArray(seatId)
      ? seatId
      : seatId !== undefined && seatId !== null
        ? [seatId]
        : [];

    if (!showtimeId || seatIds.length === 0) {
      throw new ApiError(
        "Showtime ID and at least one seat ID are required",
        400
      );
    }

    const user = await userModel.findById(id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const showtimeDetails = await showtimeModel.findById(showtimeId);
    if (!showtimeDetails) {
      throw new ApiError(`Showtime with ID ${showtimeId} not found`, 404);
    }

    // Find all seat documents for the given seat IDs
    const seatDetails = await seatModel.find({ _id: { $in: seatIds } });
    console.log("Seat details:", seatDetails);
    console.log("Seat IDs:", seatIds);
    if (seatDetails.length !== seatIds.length) {
      throw new ApiError("One or more seat IDs are invalid", 400);
    }

    // Check if any of the requested seats are already booked for this showtime
    const existingBooking = await bookingModel.findOne({
      showtime: showtimeId,
      seats: { $in: seatIds },
      isBooked: true,
    });
    if (existingBooking) {
      throw new ApiError("One or more seats are already reserved", 400);
    }

    const newBooking = await bookingModel.create({
      showtime: showtimeId,
      seats: seatIds,
      user: id,
      isBooked: true,
      isUsed: false,
    });

    // const clientData = await createClientData(user.name, user.email, user.phone);

    // const paymentIntent = await createPaymentIntent(
    //   showtimeDetails.price,
    //   process.env.LOCAL_CURRENCY,
    //   user.name,
    //   newBooking._id,
    //   user.email,
    //   clientData.id
    // );

    // if(!paymentIntent.client_secret) {
    //   throw new ApiError("Failed to create payment intent", 500);
    // }

    return newBooking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to post booking",
      error.statusCode || 500
    );
  }
};
