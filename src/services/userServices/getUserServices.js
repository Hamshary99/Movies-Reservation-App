import * as userRepository from "../../repository/userRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as seatRepository from "../../repository/seatRepository.js";

import { ApiError } from "../../utils/errorHandler.js";

export const fetchProfile = async (id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }
    const user = await userRepository.getUserById(id);
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

    const showtime = await showtimeRepository.getShowtimeById(id);

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

export const fetchShowtimesOfMovie = async (date, movieId) => {
  try {
    if (!movieId) {
      throw new ApiError("Movie ID is required", 400);
    }

    if (!date) {
      throw new ApiError("Date is required", 400);
    }

    const showtimes = await showtimeRepository.getMovieShowtimesofTheDay(movieId, date);

    if (showtimes.length === 0) {
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


export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await showtimeRepository.getAllShowtimes();

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

export const fetchBooking = async (bookingId, userId) => {
  try {
    if (!bookingId) {
      throw new ApiError("Booking ID is required", 400);
    }

    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    const booking = await bookingRepository.getBookingById(bookingId, userId);
    if (!booking) {
      throw new ApiError("Booking not found", 404);
    }

    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch booking",
      error.statusCode || 500
    );
  }
};

export const fetchAllUserBookings = async (userId) => {
  try {
    if (!userId) {
      throw new ApiError("User ID is required", 400);
    }

    const bookings = await bookingRepository.getUserBookings(userId);
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
    const showtime = await showtimeRepository.getShowtimeById(showtimeId);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }

    const seatsWithStatus = await seatRepository.getAvailableSeatsForShowtime(showtimeId, showtime.hallId);

    return seatsWithStatus;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch available seats",
      error.statusCode || 500
    );
  }
};

export const fetchMovie = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await movieRepository.getMovieById(id);
    if (!movie) {
      throw new ApiError("Movie not found", 404);
    }
    return movie;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};

export const fetchAllMovies = async () => {
  try {
    const movies = await movieRepository.getAllMovies();
    if (!movies) {
      throw new ApiError("Movies not found", 404);
    }
    return movies;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};

export const fetchShowtimesByMovieAndDate = async (movieId, date) => {
  try {
    if (!movieId) {
      throw new ApiError("Movie ID is required", 400);
    }
    if (!date) {
      throw new ApiError("Date is required", 400);
    }

    // Query with the date range
    const showtimes = await showtimeRepository.getMovieShowtimesOfTheDay(movieId, date);
    
    return showtimes;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};
