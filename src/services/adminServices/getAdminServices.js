import { showtimeModel } from "../../models/showtimeModel.js";
import { movieModel } from "../../models/movieModel.js";
import { hallModel } from "../../models/hallModel.js";
import { seatModel } from "../../models/seatModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const fetchMovie = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await movieModel.find({ _id: id });
    if (!movie) {
      throw new ApiError("Movie not found", 404);
    }
    return movie;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};

export const fetchAllMovies = async () => {
  try {
    const movies = await movieModel.find({});
    if (!movies) {
      throw new ApiError("Movies not found", 404);
    }
    return movies;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};

export const fetchHall = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Hall ID is required", 400);
    }

    const hall = await hallModel.findById(id);
    if (!hall) {
      throw new ApiError("Hall not found", 404);
    }

    const seatsOfHall = await seatModel.find({ hall: id });
    return hall;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch hall",
      error.statusCode || 500
    );
  }
};

export const fetchAllHalls = async () => {
  try {
    const halls = await hallModel.find({});
    if (!halls) {
      throw new ApiError("Halls not found", 404);
    }
    return halls;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch halls",
      error.statusCode || 500
    );
  }
};

export const fetchShowtime = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Showtime ID is required", 400);
    }

    const showtime = await showtimeModel
      .findById(id)
      .populate("movie")
      .populate("hall");
    if (!showtime) {
      throw new ApiError("Showtime is not found", 404);
    }

    return showtime;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtime",
      error.statusCode || 500
    );
  }
};

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await showtimeModel
      .find({})
      .populate("movie")
      .populate("hall");
    if (!showtimes) {
      throw new ApiError("Showtimes not found", 404);
    }
    return showtimes;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchSeatsOfHall = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Hall ID is required", 400);
    }
    const seatsOfHall = await seatModel.find({ hall: id });
    return seatsOfHall;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
}