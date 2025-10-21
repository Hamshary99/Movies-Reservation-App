import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import { ApiError } from "../../utils/errorHandler.js";
import { clearCache, clearCachePattern } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";

export const removeMovie = async (movieId) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await movieRepository.deleteMovieById(movieId);
    if (!movie) {
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
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete movies",
      error.statusCode || 500
    );
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
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete movies",
      error.statusCode || 500
    );
  }
};

export const removeHall = async (hallId) => {
  try {
    const hall = await hallRepository.deleteHall(hallId);

    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCache(cacheKeys.hall(hallId)),
      clearCache(cacheKeys.seatsOfHall(hallId)),
    ]);
    
    return hall;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete Hall",
      error.statusCode || 500
    );
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
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
  }
};

export const removeShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      throw new ApiError("Showtime ID is required", 400);
    }
    const showtime = await showtimeRepository.deleteShowtimeById(showtimeId);
    if (!showtime) {
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
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
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
    ])

    return showtimes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
  }
};
