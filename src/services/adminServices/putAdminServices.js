import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import { ApiError } from "../../utils/errorHandler.js";
import { clearCache, clearCachePattern } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";

export const updateMovie = async (id, data) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const { title, description, genres, releaseDate, ratings, director } = data;
    const movie = await movieRepository.updateMovieById(id, data);

    if (!movie) {
      throw new ApiError("Movie not found", 404);
    }

    await Promise.all([
      clearCache(cacheKeys.allMovies()),
      clearCache(cacheKeys.movie(id)),
      clearCache(cacheKeys.showtimesOfMovie(id)),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate(id, "*")),
    ]);
    return movie;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to update movie",
      error.statusCode || 500
    );
  }
};

export const updateHall = async (hallId, data) => {
  try {
    if (!hallId) {
      throw new ApiError("Hall ID is required", 400);
    }
    const { hallName, rows, columns } = data;

    // drizzle handles id as strings so we need to convert it to number
    hallId = Number(hallId);
    const { hall, seats } = await hallRepository.updateHall(
      hallId,
      hallName,
      rows,
      columns
    );

    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCache(cacheKeys.hall(hallId)),
      clearCache(cacheKeys.seatsOfHall(hallId)),
    ]);

    return { hall, seats };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch halls",
      error.statusCode || 500
    );
  }
};

export const updateShowtime = async (showtimeId, data) => {
  try {
    if (!showtimeId) {
      throw new ApiError("Showtime ID is required", 400);
    }
    const { movieId, hallId, date, time, price } = data;
      
    const showtime = await showtimeRepository.updateShowtimeById(
      showtimeId,
      data
    );

    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }

    await Promise.all([
      clearCache(cacheKeys.allShowtimes()),
      clearCache(cacheKeys.showtime(showtimeId)),
      clearCache(cacheKeys.showtimesOfMovie(movieId)),
      clearCachePattern(cacheKeys.showtimesOfMovieByDate(movieId, "*")),
      clearCache(cacheKeys.availableSeats(showtimeId)),
    ]);
    return showtime;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to update showtime",
      error.statusCode || 500
    );
  }
};
