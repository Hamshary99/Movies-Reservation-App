import * as userRepository from "../../repository/userRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as seatRepository from "../../repository/seatRepository.js";
import { cacheWrapper } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { ApiError } from "../../utils/errorHandler.js";

export const fetchProfile = async (id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }

    const user = await cacheWrapper(cacheKeys.user(id), async () => {
      const dbUser = await userRepository.getUserById(id);
      if (!dbUser) {
        throw new ApiError("User not found", 404);
      }
      return dbUser;
    })

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const showtime = await cacheWrapper(cacheKeys.showtime(id), async () => {
      const dbShowtime = await showtimeRepository.getShowtimeById(id);
      if (!dbShowtime) {
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtime;
    })

    return showtime;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchShowtimesOfMovie = async (movieId) => {
  try {
    if (!movieId) {
      throw new ApiError("Movie ID is required", 400);
    }

    const showtimes = await cacheWrapper(cacheKeys.showtimesOfMovie(movieId), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimesForMovie(
        movieId,
      );
      if (!dbShowtimes || dbShowtimes.length === 0) {
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    })

    return showtimes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await cacheWrapper(cacheKeys.allShowtimes(), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimes();
      if (!dbShowtimes || dbShowtimes.length === 0) {
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    })

    return showtimes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const booking = await cacheWrapper(cacheKeys.booking(userId, bookingId), async () => {
      const dbBooking = await bookingRepository.getBookingById(
        bookingId,
        userId
      );
      if (!dbBooking) {
        throw new ApiError("Booking not found", 404);
      }
      return dbBooking;
    });

    return booking;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const bookings = await cacheWrapper(cacheKeys.userBookings(userId), async () => {
      const dbBookings = await bookingRepository.getUserBookings(userId);
      if (!dbBookings || dbBookings.length === 0) {
        throw new ApiError("Bookings not found", 404);
      }
      return dbBookings;
    })

    return bookings;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

// It might be better not to cache this function as it depends on live data, 
// it will be handled soon by invalidating the cache after every update, post and delete
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

    const seatsWithStatus = await seatRepository.getAvailableSeatsForShowtime(
      showtimeId,
      showtime.hallId
    );

    return seatsWithStatus;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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
    const movie = await cacheWrapper(cacheKeys.movie(id), async () => {
      const dbMovie = await movieRepository.getMovieById(id);
      if (!dbMovie) {
        throw new ApiError("Movie not found", 404);
      }
      return dbMovie;
    })
    return movie;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};

export const fetchAllMovies = async () => {
  try {
    const movies = await cacheWrapper(cacheKeys.allMovies(), async () => {
      const dbMovies = await movieRepository.getAllMovies();
      if (!dbMovies) {
        throw new ApiError("Movies not found", 404);
      }
      return dbMovies;
    })
    return movies;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const showtimes = await cacheWrapper(cacheKeys.showtimesOfMovieByDate(movieId, date), async () => {
      const dbShowtimes = await showtimeRepository.getMovieShowtimesOfTheDay(
        movieId,
        date
      );
      if (!dbShowtimes) {
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    });

    return showtimes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};
