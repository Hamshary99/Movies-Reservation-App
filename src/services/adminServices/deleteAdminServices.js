import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import { ApiError } from "../../utils/errorHandler.js";
import { clearCache, clearCachePattern } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import logger from "../../utils/logger.js";

const handleServiceError = (message, error, context = {}) => {
  logger.error(message, {
    message: error.message,
    stack: error.stack,
    ...context,
  });
  if (error instanceof ApiError) throw error;
  throw new ApiError(error.message || message, error.statusCode || 500, error);
};

export const removeMovie = async (movieId) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in removeMovie", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await movieRepository.deleteMovieById(movieId);
    if (!movie) {
      logger.warn("Movie not found", { movieId });
      throw new ApiError("Movie not found", 404);
    }

    await Promise.all([
      clearCache(cacheKeys.allMovies()),
      clearCache(cacheKeys.movie(movieId)),
      clearCache(cacheKeys.showtimesOfMovie(movieId)),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate(movieId, "*")),
    ]);

    return movie;
  } catch (error) {
    handleServiceError("Failed to delete movie", error, { movieId });
  }
};

export const removeAllMovies = async () => {
  try {
    const movies = await movieRepository.deleteAllMovies();

    await Promise.all([
      clearCache(cacheKeys.allMovies()),
      clearCachePattern(cacheKeys.movie("*")),
      clearCachePattern(cacheKeys.showtimesOfMovie("*")),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate("*", "*")),
    ]);

    return movies;
  } catch (error) {
    handleServiceError("Failed to delete movies", error);
  }
};

export const removeHall = async (hallId) => {
  try {
    if (!hallId) {
      logger.warn("Hall ID is missing in removeHall", { hallId });
      throw new ApiError("Hall ID is required", 400);
    }
    logger.debug("Deleting hall", { hallId });
    const hall = await hallRepository.deleteHall(hallId);

    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCache(cacheKeys.hall(hallId)),
      clearCache(cacheKeys.seatsOfHall(hallId)),
    ]);
    
    return hall;
  } catch (error) {
    handleServiceError("Failed to delete hall", error, { hallId });
  }
};

export const removeAllHalls = async () => {
  try {
    const halls = await hallRepository.deleteHalls();

    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCachePattern(cacheKeys.hall("*")),
      clearCachePattern(cacheKeys.seatsOfHall("*")),
    ]);

    return halls;
  } catch (error) {
    handleServiceError("Failed to delete halls", error);
  }
};

export const removeShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      logger.warn("Showtime ID is missing in removeShowtime", { showtimeId });
      throw new ApiError("Showtime ID is required", 400);
    }
    logger.debug("Deleting showtime", { showtimeId });
    const showtime = await showtimeRepository.deleteShowtimeById(showtimeId);
    if (!showtime) {
      logger.warn("Showtime not found", { showtimeId });
      throw new ApiError("Showtime not found", 404);
    }

    await Promise.all([
      clearCache(cacheKeys.allShowtimes()),
      clearCache(cacheKeys.showtime(showtimeId)),
      clearCache(cacheKeys.showtimesOfMovie(showtime.movieId)),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate(showtime.movieId, "*")),
      clearCache(cacheKeys.availableSeats(showtimeId)),
    ])

    return showtime;
  } catch (error) {
    handleServiceError("Failed to delete showtime", error, { showtimeId });
  }
};

export const removeAllShowtimes = async () => {
  try {
    const showtimes = await showtimeRepository.deleteAllShowtimes();

    await Promise.all([
      clearCache(cacheKeys.allShowtimes()),
      clearCachePattern(cacheKeys.showtime("*")),
      clearCachePattern(cacheKeys.showtimesOfMovie("*")),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate("*", "*")),
      clearCachePattern(cacheKeys.availableSeats("*")),
    ]);

    return showtimes;
  } catch (error) {
    handleServiceError("Failed to delete showtimes", error);
  }
};
