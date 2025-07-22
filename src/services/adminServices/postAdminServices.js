import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";
import { seatModel } from "../../models/seatModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const createMovie = async (data) => {
  try {
    const {
      title,
      description,
      genres,
      releaseDate,
      ratings,
      director,
      posterUrl,
      posterFile,
    } = data;

    if (
      !title ||
      !description ||
      !genres ||
      !releaseDate ||
      !ratings ||
      !director
    ) {
      throw new ApiError("Missing required fields", 400);
    }

    const isExist = await movieModel.findOne({ title });
    if (isExist) {
      throw new ApiError("Movie already exists", 400);
    }

    // Handle poster (either URL or file)
    let posterData = {};
    if (posterUrl) {
      posterData.posterUrl = posterUrl;
    } else if (posterFile) {
      posterData.posterFile = posterFile;
    }

    const movie = await movieModel.create({
      title,
      genres,
      releaseDate,
      ratings,
      description,
      director,
      ...posterData,
    });

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
    const { hallName, rows, columns } = data;
    if (!hallName || !rows || !columns) {
      throw new ApiError("Missing required fields", 400);
    }

    const isExist = await hallModel.findOne({ name: hallName });
    if (isExist) {
      throw new ApiError("Hall already exists", 400);
    }

    const hall = await hallModel.create({
      name: hallName,
      rows,
      columns,
    });

    const seats = [];
    for (let row = 1; row <= rows; row++) {
      for (let column = 1; column <= columns; column++) {
        seats.push({
          hall: hall._id,
          row,
          column,
          label: String.fromCharCode(64 + row) + column, // e.g., A1, B2
        });
      }
    }
    await seatModel.insertMany(seats);

    return hall;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to create hall",
      error.statusCode || 500
    );
  }
};

export const createShowtime = async (data) => {
  try {
    const { movieId, hallId, date, time, price } = data;
    if (!movieId || !hallId || !date || !time || !price) {
      throw new ApiError("Missing required fields", 400);
    }

    const isExist = await showtimeModel.findOne({
      movie: movieId,
      hall: hallId,
      date,
      time,
    });
    if (isExist) {
      throw new ApiError("Showtime already exists", 400);
    }

    const showtime = await showtimeModel.create({
      movie: movieId,
      hall: hallId,
      date,
      time,
      price,
    });
    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to create showtime",
      error.statusCode || 500
    );
  }
};
