import {
  fetchProfile,
  fetchShowtime,
  fetchAllShowtimes,
  fetchShowtimesByMovieAndDate,
  fetchBooking,
  fetchAllUserBookings,
  fetchAvailableSeatsForShowtime,
  fetchMovie,
  fetchAllMovies,
  fetchShowtimesOfMovie,
} from "../services/userServices/getUserServices.js";

import { postBookingTicket } from "../services/userServices/postUserServices.js";

import {
  updateProfile,
  updateBooking,
} from "../services/userServices/putUserServices.js";

import { deleteBookingTicket } from "../services/userServices/deleteUserServices.js";

export const getProfile = async (req, res, next) => {
  try {
    // Only allow if the requested id matches the logged-in user's id
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this profile." });
    }

    const user = await fetchProfile(req.params.id || req.query.id);

    res.json({
      message: "User profile fetched successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

export const putProfile = async (req, res, next) => {
  try {
    // Only allow if the requested id matches the logged-in user's id
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this profile." });
    }
    const updatedUser = await updateProfile(
      req.params.id || req.query.id,
      req.body,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getShowtimes = async (req, res, next) => {
  try {
    const showtimes = await fetchAllShowtimes();
    res.status(200).json({
      message: "All showtimes fetched successfully",
      showtime: showtimes,
    });
  } catch (error) {
    next(error);
  }
};

export const getShowtime = async (req, res, next) => {
  try {
    const showtime = await fetchShowtime(req.params.id);
    res
      .status(200)
      .json({ message: "Showtime fetched successfully", showtime: showtime });
  } catch (error) {
    next(error);
  }
};

export const getShowtimesOfMovie = async (req, res, next) => {
  try {
    const { date, movieId } = req.query;
    console.log("date: ", date);
    console.log("movie: ", movieId);
    const showtime = await fetchShowtimesOfMovie(date, movieId);
    res.status(200).json({
      message: "Showtimes fetched successfully",
      showtime: showtime,
    });
  } catch (error) {
    next(error);
  }
};

export const postBooking = async (req, res, next) => {
  try {
    const booking = await postBookingTicket(req.body, req.user._id);
    res.status(201).json({ message: "Ticket reserved successfully", booking });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await fetchBooking(req.params.id || req.query.id);
    res.status(200).json({ message: "Booking fetched successfully", booking });
  } catch (error) {
    next(error);
  }
};

export const getAllUserBookings = async (req, res, next) => {
  try {
    // const userId = req.user._id;
    // // console.log("User ID:", userId);

    // const bookings = await bookingModel
    //   .find({ user: userId })
    //   .populate("showtime")
    //   .populate("seats")
    //   .populate("user");

    const bookings = await fetchAllUserBookings(req.user._id);
    res.status(200).json({
      message: "User bookings fetched successfully",
      booking: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSeatsForShowtime = async (req, res, next) => {
  try {
    const seats = await fetchAvailableSeatsForShowtime(req.params.id);
    res
      .status(200)
      .json({ message: "Available seats fetched successfully", seats });
  } catch (error) {
    next(error);
  }
};

//Should never update a booking when it's 72h before the showtime
export const putBooking = async (req, res) => {
  try {
    // const { bookingId } = req.params || req.query; // Get booking ID from params or query
    // const { showtimeId, seatId } = req.body;
    // if (!bookingId) {
    //   return res.status(400).json({ message: "Booking ID is required" });
    // }

    // // Check ownership
    // const booking = await bookingModel.findById(bookingId);
    // if (!booking) {
    //   return res.status(404).json({ message: "Booking not found" });
    // }
    // if (booking.user.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json({ message: "You do not have permission to update this booking" });
    // }
    // // Always get the showtime date from the showtime referenced by the booking
    // const showtime = await showtimeModel.findById(booking.showtime);
    // if (!showtime) {
    //   return res.status(404).json({ message: "Showtime not found" });
    // }
    // if (new Date(showtime.date) - new Date() < 72 * 60 * 60 * 1000) {
    //   return res
    //     .status(400)
    //     .json({ message: "Cannot update booking 72h before showtime" });
    // }
    // if (booking.isUsed) {
    //   return res.status(400).json({ message: "Ticket has already been used" });
    // }
    // // Update booking
    // booking.showtime = showtimeId;
    // booking.seats = seatId;
    // await booking.save();

    const updatedBooking = await updateBooking(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await deleteBookingTicket(
      req.params.id,
      req.user._id
    );
    res.status(200).json({
      message: "Booking deleted successfully",
      booking: deletedBooking,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovies = async (req, res, next) => {
  try {
    const movies = await fetchAllMovies();
    res.status(200).json({ message: "Movies fetched successfully", movies });
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    if (!req.params.id || req.params.id === "") {
      return res.status(400).json({ message: "Movie ID is required" });
    }
    const movie = await fetchMovie(req.params.id || req.query.id);
    res.status(200).json({ message: "Movie fetched successfully", movie });
  } catch (error) {
    next(error);
  }
};

// Add this new controller function
export const getShowtimesByMovieAndDate = async (req, res, next) => {
  try {
    const { movieId, date } = req.params;
    const showtimes = await fetchShowtimesByMovieAndDate(movieId, date);
    res.status(200).json({
      message: "Showtimes fetched successfully",
      showtimes: showtimes,
    });
  } catch (error) {
    next(error);
  }
};
