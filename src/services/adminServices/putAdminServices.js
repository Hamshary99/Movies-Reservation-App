import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const updateMovie = async (id, data) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const { title, description, genres, releaseDate, ratings, director } = data;
    const movie = await movieModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        genres,
        releaseDate,
        ratings,
        director,
      },
      {
        new: true,
        runValidators: true,
      }
    );

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
      throw new ApiError("Movie ID is required", 400);
    }
    const { hallName, rows, columns } = data;

    const hall = await hallModel.findByIdAndUpdate(
      id,
      {
        name: hallName,
        rows,
        columns,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!hall) {
      throw new ApiError("Hall not found", 404);
    }
    return hall;
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
    const { movieId, hallId, date, time } = data;
      
    const showtime = await showtimeModel.findByIdAndUpdate(
      id,
      {
        movie: movieId,
        hall: hallId,
        date,
        time,
      },
      {
        new: true,
        runValidators: true,
      }
    );

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
