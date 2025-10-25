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

export const updateMovie = async (movieId, data) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in updateMovie", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }
    const { title, description, genres, releaseDate, ratings, director } = data;
    logger.debug("Updating movie", { movieId, data });
    const movie = await movieRepository.updateMovieById(movieId, data);
    logger.debug("Updated movie", { movie });

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
    handleServiceError("Failed to update movie", error);
  }
};

export const updateHall = async (hallId, data) => {
  try {
    if (!hallId) {
      logger.warn("Hall ID is missing in updateHall", { hallId });
      throw new ApiError("Hall ID is required", 400);
    }
    const { hallName, rows, columns } = data;

    // drizzle handles id as strings so we need to convert it to number
    hallId = Number(hallId);
    logger.debug("Updating hall", { hallId, data });
    const { hall, seats } = await hallRepository.updateHall(
      hallId,
      hallName,
      rows,
      columns
    );
    
    if (!hall) {
      logger.warn("Hall not found", { hallId });
      throw new ApiError("Hall not found", 404);
    }
    
    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCache(cacheKeys.hall(hallId)),
      clearCache(cacheKeys.seatsOfHall(hallId)),
    ]);
    
    logger.debug("Updated hall", { hall, seats, seatsCount: seats.length });
    return { hall, seats };
  } catch (error) {
    handleServiceError("Failed to update hall", error);
  }
};

export const updateShowtime = async (showtimeId, data) => {
  try {
    if (!showtimeId) {
      logger.warn("Showtime ID is missing in updateShowtime", { showtimeId });
      throw new ApiError("Showtime ID is required", 400);
    }
    const { movieId, hallId, date, time, price } = data;
      
    logger.debug("Updating showtime", { showtimeId, data });
    const showtime = await showtimeRepository.updateShowtimeById(
      showtimeId,
      data
    );

    if (!showtime) {
      logger.warn("Showtime not found", { showtimeId });
      throw new ApiError("Showtime not found", 404);
    }

    await Promise.all([
      clearCache(cacheKeys.allShowtimes()),
      clearCache(cacheKeys.showtime(showtimeId)),
      clearCache(cacheKeys.showtimesOfMovie(movieId)),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate(movieId, "*")),
      clearCache(cacheKeys.availableSeats(showtimeId)),
    ]);
    logger.debug("Updated showtime", { showtime });
    return showtime;
  } catch (error) {
    handleServiceError("Failed to update showtime", error);
  }
};
