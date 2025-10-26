import * as hallRepository from "../../repository/hallRepository.js";
import * as hallSchema from "../../models/hallSchema.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import { ApiError } from "../../utils/errorHandler.js";
import { clear, error } from "console";
import { z } from "zod";
import { clearCache } from "../../utils/cache.js";
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

export const createMovie = async (data) => {
  try {
    const isMovieExist = await movieRepository.getMovieByTitle(data.title);
    if (isMovieExist) {
      logger.warn("Movie with this title already exists", { title: data.title });
      throw new ApiError("Movie with this title already exists", 400);
    }

    logger.debug("Creating new movie", { data });
    const movie = await movieRepository.createMovie(data);

    await Promise.all([
      clearCache(cacheKeys.allMovies()),
      clearCache(cacheKeys.movie(movie.id)),
    ]);

    return movie;
  } catch (error) {
    handleServiceError("Failed to create a movie", error);
  }
};

export const createHall = async (data) => {
  try {
    logger.debug("Creating new hall", { data });
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
    logger.debug("Created new hall", { hall, seats, seatsCount: seats.length });

    return { hall, seats };
  } catch (error) {
    handleServiceError("Failed to create a hall", error);
  }
};

export const createShowtime = async (data) => {
  try {
    logger.debug("Creating new showtime", { data });
    const isExist = await showtimeRepository.checkShowtimeAvailability(
      data.date,
      data.time
    );
    if (isExist) {
      logger.warn("Showtime on this date and time already exists", { date: data.date, time: data.time });
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
    handleServiceError("Failed to create showtime", error);
  }
};
