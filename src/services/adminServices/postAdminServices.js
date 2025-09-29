import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";
import { seatModel } from "../../models/seatModel.js";

import * as hallRepository from "../../repository/hallRepository.js";
import * as hallSchema from "../../models/hallSchema.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";

import { ApiError, SQLError } from "../../utils/errorHandler.js";
import { error } from "console";
import { z } from "zod";

export const createMovie = async (data) => {
  try {
    const isMovieExist = await movieRepository.getMovieByTitle(data.title);
    if (isMovieExist) {
      throw new ApiError("Movie with this title already exists", 400);
    }
    const movie = await movieRepository.createMovie(data);

    return movie;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to create movie",
      error.statusCode || 500
    );
  }
};

export const createHall = async (data) => {
  try {
    // const parsedData = hallSchema.hallDataVerify.safeParse(data);
    // if (!parsedData.success) {
    //   const flatten = parsedData.error.flatten();
    //   const missingFields = Object.keys(flatten.fieldErrors);
    //   throw new SQLError(`Validation failed: ${missingFields.join(", ")} field/s are missing or invalid`, 400);
    // }

    const { hall, seats } = await hallRepository.createHall(
      data.hallName,
      data.rows,
      data.columns
    );

    return { hall, seats };
  } catch (error) {
    throw error;
  }
};

export const createShowtime = async (data) => {
  try {
    // const { movieId, hallId, date, time, price } = data;
    // if (!movieId || !hallId || !date || !time || !price) {
    //   throw new ApiError("Missing required fields", 400);
    // }

    const isExist = await showtimeRepository.checkShowtimeAvailability(
      data.date,
      data.time
    );
    if (isExist) {
      throw new ApiError("Showtime on this date and time already exists", 400);
    }

    const showtime = await showtimeRepository.createShowtime(data);
    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to create showtime",
      error.statusCode || 500
    );
  }
};
