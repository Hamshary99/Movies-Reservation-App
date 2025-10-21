import * as hallRepository from "../../repository/hallRepository.js";
import * as hallSchema from "../../models/hallSchema.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import { ApiError, SQLError } from "../../utils/errorHandler.js";
import { clear, error } from "console";
import { z } from "zod";
import { clearCache } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";

export const createMovie = async (data) => {
  try {
    const isMovieExist = await movieRepository.getMovieByTitle(data.title);
    if (isMovieExist) {
      throw new ApiError("Movie with this title already exists", 400);
    }
    const movie = await movieRepository.createMovie(data);

    await Promise.all([
      clearCache(cacheKeys.allMovies()),
      clearCache(cacheKeys.movie(movie.id)),
    ]);

    return movie;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to create movie",
      error.statusCode || 500
    );
  }
};

export const createHall = async (data) => {
  try {
    const { hall, seats } = await hallRepository.createHall(
      data.hallName,
      data.rows,
      data.columns
    );

    await Promise.all([
      clearCache(cacheKeys.allHalls()),
      clearCache(cacheKeys.hall(hall.id)),
      clearCache(cacheKeys.seatsOfHall(hall.id)),
    ]);

    return { hall, seats };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to create a hall",
      error.statusCode || 500
    );
  }
};

export const createShowtime = async (data) => {
  try {
    const isExist = await showtimeRepository.checkShowtimeAvailability(
      data.date,
      data.time
    );
    if (isExist) {
      throw new ApiError("Showtime on this date and time already exists", 400);
    }

    const showtime = await showtimeRepository.createShowtime(data);

    await Promise.all([
      clearCache(cacheKeys.allShowtimes()),
      clearCache(cacheKeys.showtime(showtime.id)),
      clearCache(cacheKeys.showtimesOfMovie(showtime.movieId)),
    ]);

    return showtime;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to create showtime",
      error.statusCode || 500
    );
  }
};
