import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";
import { seatModel } from "../../models/seatModel.js";
import { bookingModel } from "../../models/bookingModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const removeMovie = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await movieModel.findByIdAndDelete(id);
    if (!movie) {
      throw new ApiError("Movie not found", 404);
    }
    return movie;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete movies",
      error.statusCode || 500
    );
  }
};

export const removeAllMovies = async () => {
  try {
    const movies = await movieModel.deleteMany({});

    return movies;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete movies",
      error.statusCode || 500
    );
  }
};

export const removeHall = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Hall ID is required", 400);
    }
    const hall = await hallModel.findByIdAndDelete(id);
    if (!hall) {
      throw new ApiError("Hall not found", 404);
    }

    await seatModel.deleteMany({ hall: id });
    await showtimeModel.deleteMany({ hall: id });
    await bookingModel.deleteMany({ showtime: showtime.hall.id });
    
    return hall;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete Hall",
      error.statusCode || 500
    );
  }
};

export const removeAllHalls = async () => {
  try {
    const halls = await hallModel.deleteMany({});
    await seatModel.deleteMany({});
    await bookingModel.deleteMany({});
    return halls;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
  }
};

export const removeShowtime = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Showtime ID is required", 400);
    }
    const showtime = await showtimeModel.findByIdAndDelete(id);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }
    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
  }
};

export const removeAllShowtimes = async () => {
  try {
    const showtimes = await showtimeModel.deleteMany({});
    return showtimes;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to delete halls",
      error.statusCode || 500
    );
  }
};
