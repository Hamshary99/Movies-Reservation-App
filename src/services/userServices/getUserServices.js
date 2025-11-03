import * as userRepository from "../../repository/userRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as bookingRepository from "../../repository/bookingRepository.js";
import * as seatRepository from "../../repository/seatRepository.js";
import { cacheWrapper } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { ApiError } from "../../utils/errorHandler.js";
import logger from "../../utils/logger.js";

const handleServiceError = (message, error, context = {}) => {
  logger.error(message, {
    message: error.message,
    stack: error.stack,
    ...context,
  });
  if (error instanceof ApiError) throw error;
  throw new ApiError(
    error.message || message,
    error.statusCode || 500,
    error
  );
}

export const fetchProfile = async (userId) => {
  try {
    if (!userId) {
      logger.warn("User ID is missing in fetchProfile", { userId });
      throw new ApiError("User ID is required", 400);
    }

    logger.debug("Fetching user profile", { userId });
    const user = await cacheWrapper(cacheKeys.user(userId), async () => {
      const dbUser = await userRepository.getUserById(userId);
      if (!dbUser) {
        logger.warn("User not found", { userId });
        throw new ApiError("User not found", 404);
      }
      return dbUser;
    });

    return user;
  } catch (error) {
    handleServiceError("Failed to fetch user profile", error, { userId });
  }
};

export const fetchShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      logger.warn("Showtime ID is missing in fetchShowtime", { showtimeId });
      throw new ApiError("Showtime ID is required", 400);
    }

    logger.debug("Fetching showtime", { showtimeId });
    const showtime = await cacheWrapper(cacheKeys.showtime(showtimeId), async () => {
      const dbShowtime = await showtimeRepository.getShowtimeById(showtimeId);
      if (!dbShowtime) {
        logger.warn("Showtime not found", { showtimeId });
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtime;
    });

    return showtime;
  } catch (error) {
    handleServiceError("Failed to fetch showtime", error, { showtimeId });
  }
};

export const fetchShowtimesOfMovie = async (movieId) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in fetchShowtimesOfMovie", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }

    const showtimes = await cacheWrapper(cacheKeys.showtimesOfMovie(movieId), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimesForMovie(
        movieId,
      );
      if (!dbShowtimes || dbShowtimes.length === 0) {
        logger.warn("Showtime not found for movie: " + movieId);
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    });

    return showtimes;
  } catch (error) {
    handleServiceError("Failed to fetch showtimes of movie", error, { movieId });
  }
};

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await cacheWrapper(cacheKeys.allShowtimes(), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimes();
      if (!dbShowtimes || dbShowtimes.length === 0) {
        logger.warn("Showtime not found");
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    });

    return showtimes;
  } catch (error) {
    handleServiceError("Failed to fetch all showtimes", error, {});
  }
};

export const fetchBooking = async (bookingId, userId) => {
  try {
    if (!bookingId) {
      logger.warn("Booking ID is missing in fetchBooking", { bookingId });
      throw new ApiError("Booking ID is required", 400);
    }

    if (!userId) {
      logger.warn("User ID is missing in fetchBooking", { userId });
      throw new ApiError("User ID is required", 400);
    }

    const booking = await cacheWrapper(cacheKeys.booking(userId, bookingId), async () => {
      const dbBooking = await bookingRepository.getBookingById(
        bookingId,
        userId
      );
      if (!dbBooking) {
        logger.warn("Booking not found", { bookingId, userId });
        // throw new ApiError("Booking not found", 404);
        return null;
      }
      return dbBooking;
    });

    return booking;
  } catch (error) {
    handleServiceError("Failed to fetch booking", error, { bookingId, userId });
  }
};

export const fetchAllUserBookings = async (userId) => {
  try {
    if (!userId) {
      logger.warn("User ID is missing in fetchAllUserBookings", { userId });
      throw new ApiError("User ID is required", 400);
    }

    const bookings = await cacheWrapper(cacheKeys.userBookings(userId), async () => {
      const dbBookings = await bookingRepository.getUserBookings(userId);
      if (!dbBookings || dbBookings.length === 0) {
        logger.warn("Bookings not found", { userId });
        throw new ApiError("Bookings not found", 404);
      }
      return dbBookings;
    });

    return bookings;
  } catch (error) {
    handleServiceError("Failed to fetch all user bookings", error, { userId });
  }
};

// Since this API relies on live data, we will cache it with relying on the cache deletion mechanism in other APIs
export const fetchAvailableSeatsForShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      logger.warn("Showtime ID is missing in fetchAvailableSeatsForShowtime", { showtimeId });
      throw new ApiError("Showtime ID is required", 400);
    }
    // Find the showtime
    const showtime = await cacheWrapper(cacheKeys.showtime(showtimeId), async () => {
      const dbShowtime = await showtimeRepository.getShowtimeById(showtimeId);
      if (!dbShowtime) {
        logger.warn("Showtime not found", { showtimeId });
        throw new ApiError("Showtime not found", 404);
      }
      return dbShowtime;
    });

    // Find the available seats
    // const seatsWithStatus = await cacheWrapper(cacheKeys.availableSeats(showtimeId), async () => {
    //   const dbSeatsWithStatus = await bookingRepository.getAvailableSeatsForShowtime(showtimeId);
    //   if (!dbSeatsWithStatus || dbSeatsWithStatus.length === 0) {
    //     logger.warn("Available seats not found", { showtimeId });
    //     throw new ApiError("Available seats not found", 404);
    //   }
    //   return dbSeatsWithStatus;
    // });

    const seatsWithStatus = await bookingRepository.getAvailableSeatsForShowtime(showtimeId);

    return seatsWithStatus;
  } catch (error) {
    handleServiceError("Failed to fetch available seats for showtime", error, { showtimeId });
  }
};

export const fetchMovie = async (movieId) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in fetchMovie", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await cacheWrapper(cacheKeys.movie(movieId), async () => {
      const dbMovie = await movieRepository.getMovieById(movieId);
      if (!dbMovie) {
        logger.warn("Movie not found", { movieId });
        throw new ApiError("Movie not found", 404);
      }
      return dbMovie;
    });
    return movie;
  } catch (error) {
    handleServiceError("Failed to fetch movie", error, { movieId });
  }
};

export const fetchAllMovies = async () => {
  try {
    const movies = await cacheWrapper(cacheKeys.allMovies(), async () => {
      const dbMovies = await movieRepository.getAllMovies();
      if (!dbMovies) {
        logger.warn("Movies not found");
        throw new ApiError("Movies not found", 404);
      }
      return dbMovies;
    });
    return movies;
  } catch (error) {
    handleServiceError("Failed to fetch all movies", error, {});
  }
};

export const fetchShowtimesByMovieAndDate = async (movieId, date) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in fetchShowtimesByMovieAndDate", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }
    if (!date) {
      logger.warn("Date is missing in fetchShowtimesByMovieAndDate", { date });
      throw new ApiError("Date is required", 400);
    }

    const showtimes = await cacheWrapper(cacheKeys.showtimesOfMovieByDate(movieId, date), async () => {
      const dbShowtimes = await showtimeRepository.getMovieShowtimesOfTheDay(
        movieId,
        date
      );
      if (!dbShowtimes) {
        logger.warn("Showtime not found", { movieId, date });
        throw new ApiError("Showtime is not found", 404);
      }
      return dbShowtimes;
    });

    return showtimes;
  } catch (error) {
    handleServiceError("Failed to fetch showtimes by movie and date", error, { movieId, date });
  }
};
