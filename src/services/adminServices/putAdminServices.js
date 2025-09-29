import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";

import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";

import { ApiError } from "../../utils/errorHandler.js";

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
    return movie;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to update movie",
      error.statusCode || 500
    );
  }
};

export const updateHall = async (id, data) => {
  try {
    if (!id) {
      throw new ApiError("Hall ID is required", 400);
    }
    const { hallName, rows, columns } = data;

    // drizzle handles id as strings so we need to convert it to number
    id = Number(id);
    console.log("updateHall params:", {
      id,
      hallName,
      rows,
      columns,
      typeOfId: typeof id,
    });
    const { hall, seats } = await hallRepository.updateHall(
      id,
      hallName,
      rows,
      columns
    );

    return { hall, seats };
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch halls",
      error.statusCode || 500
    );
  }
};

export const updateShowtime = async (id, data) => {
  try {
    if (!id) {
      return res.status(400).json({ message: "Showtime ID is required" });
    }
    const { movieId, hallId, date, time, price } = data;
      
    const showtime = await showtimeRepository.updateShowtimeById(id, data);

    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }
    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to update showtime",
      error.statusCode || 500
    );
  }
};
