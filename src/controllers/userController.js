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

import {
  postBookingTicket,
} from "../services/userServices/postUserServices.js";

import {
  updateProfile,
  updateBooking,
} from "../services/userServices/putUserServices.js";

import { deleteBookingTicket } from "../services/userServices/deleteUserServices.js";

import { ApiError } from "../utils/errorHandler.js";

export const getProfile = async (req, res, next) => {
  try {
    // Only allow if the requested id matches the logged-in user's id
    if (req.user._id.toString() !== req.params.id) {
      throw new ApiError("You are not allowed to view this profile.", 403);
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
      throw new ApiError("You are not allowed to update this profile.", 403);
    }

    if(req.body.password || req.body.confirmPassword) {
      throw new ApiError("Password cannot be updated here. Use the change password route.", 400);
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

export const deleteProfile = async (req, res, next) => {
  try {
    if( req.user._id.toString() !== req.params.id) {
      throw new ApiError("You are not allowed to delete this profile.", 403);
    }
    
    await userModel.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
      message: "User deleted successfully",
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
    // console.log("date: ", date);
    // console.log("movie: ", movieId);
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
    res.status(201).json({ message: "Ticket reserved and about to pay", paymentData: booking });
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

//Should never update a booking when it's 24h before the showtime
export const putBooking = async (req, res, next) => {
  try {
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
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
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
    next(error);
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
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await fetchMovie(req.params.id || req.query.id);
    res.status(200).json({ message: "Movie fetched successfully", movie });
  } catch (error) {
    next(error);
  }
};


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

