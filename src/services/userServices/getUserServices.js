import { bookingModel } from "../../models/bookingModel.js";
import { userModel } from "../../models/userModel.js";
import { showtimeModel } from "../../models/showtimeModel.js";
import { seatModel } from "../../models/seatModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const fetchProfile = async (id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }
    const user = await userModel.findById(id).select("-password -__v");
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch profile",
      error.statusCode || 500
    );
  }
};

export const fetchShowtime = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Showtime ID is required", 400);
    }

    const showtime = await showtimeModel
      .findById(id)
      .populate("movie")
      .populate("hall");
    if (!showtime) {
      throw new ApiError("Showtime is not found", 404);
    }

    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await showtimeModel
      .find()
      .populate("movie")
      .populate("hall");
    if (!showtimes) {
      throw new ApiError("Showtimes not found", 404);
    }
    return showtimes;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchBooking = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Booking ID is required", 400);
    }

    const booking = await bookingModel
      .findById(id)
      .populate("showtime")
      .populate("seats")
      .populate("user");

    if (!booking) {
      throw new ApiError("Booking is not found", 404);
      }

    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAllUserBookings = async (id) => {
  try {
    const bookings = await bookingModel
      .find({user: id})
      .populate("showtime")
      .populate("seats")
      .populate("user");
    if (!bookings) {
      throw new ApiError("Bookings not found", 404);
    }
    return bookings;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAvailableSeatsForShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      throw new ApiError("Showtime ID is required", 400);
    }
    // Find the showtime
    const showtime = await showtimeModel.findById(showtimeId);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }
    // Get all seats for the hall
    const allSeats = await seatModel.find({ hall: showtime.hall });
    // Find all booked seats for this showtime
    const bookings = await bookingModel.find({ showtime: showtimeId, isBooked: true });
    const bookedSeatIds = bookings.flatMap(b => b.seats.map(s => s.toString()));

    const seatsWithStatus = allSeats.map(seat => ({
      ...seat.toObject(),
      reserved: bookedSeatIds.includes(seat._id.toString()),
    }));
    return seatsWithStatus;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch available seats",
      error.statusCode || 500
    );
  }
};