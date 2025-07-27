import { bookingModel } from "../../models/bookingModel.js";
import { userModel } from "../../models/userModel.js";
import { showtimeModel } from "../../models/showtimeModel.js";
import { seatModel } from "../../models/seatModel.js";
import { movieModel } from "../../models/movieModel.js";

import { ApiError } from "../../utils/errorHandler.js";

export const fetchProfile = async (id) => {
  try {
    if (!id) {
      throw new ApiError("User ID is required", 400);
    }
    const user = await userModel.findById(id).select("-password -__v");
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch profile",
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
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};



export const fetchShowtimesOfMovie = async (date, movieId) => {
  try {
    if (!movieId) {
      throw new ApiError("Movie ID is required", 400);
    }

    if (!date) {
      throw new ApiError("Date is required", 400);
    }

    // Since date finding is too strict in mongoose
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);

    // console.log(
    //   "Searching showtimes for",
    //   movieId,
    //   "between",
    //   startOfDay,
    //   "and",
    //   endOfDay
    // );
    // const debug = await showtimeModel.find({ movie: movieId });
    // console.log(debug.map((doc) => doc.date));
    const showtimes = await showtimeModel
      .find({
        movie: movieId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate("movie")
      .populate("hall");
    if (showtimes.length === 0) {
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

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await showtimeModel
      .find()
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

export const fetchBooking = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Booking ID is required", 400);
    }

    const booking = await bookingModel
      .findById(id)
      .populate({
        path: "showtime",
        populate: { path: "movie" },
        populate: { path: "hall" },
      })
      .populate("seats")
      .populate({
        path: "user",
        select: "-password -__v",
      });

    if (!booking) {
      throw new ApiError("Booking is not found", 404);
      }

    return booking;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAllUserBookings = async (id) => {
  try {
    const bookings = await bookingModel
      .find({user: id})
      .populate({
        path: "showtime",
        populate: { path: "movie" },
        populate: { path: "hall" },
      })
      .populate("seats")
      .populate({
        path: "user",
        select: "-password -__v",
      });
    if (!bookings) {
      throw new ApiError("Bookings not found", 404);
    }
    return bookings;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};

export const fetchAvailableSeatsForShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      throw new ApiError("Showtime ID is required", 400);
    }
    // Find the showtime
    const showtime = await showtimeModel.findById(showtimeId);
    if (!showtime) {
      throw new ApiError("Showtime not found", 404);
    }
    // Get all seats for the hall
    const allSeats = await seatModel.find({ hall: showtime.hall });
    // Find all booked seats for this showtime
    const bookings = await bookingModel.find({ showtime: showtimeId, isBooked: true });
    const bookedSeatIds = bookings.flatMap(b => b.seats.map(s => s.toString()));

    const seatsWithStatus = allSeats.map(seat => ({
      ...seat.toObject(),
      reserved: bookedSeatIds.includes(seat._id.toString()),
    }));
    return seatsWithStatus;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch available seats",
      error.statusCode || 500
    );
  }
};

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


export const fetchShowtimesByMovieAndDate = async (movieId, date) => {
  try {
    if (!movieId) {
      throw new ApiError("Movie ID is required", 400);
    }
    if (!date) {
      throw new ApiError("Date is required", 400);
    }
    
    // Parse the date string (YYYY-MM-DD)
    console.log("Date string received:", date);
    
    // Create date objects for start and end of day
    const dateObj = new Date(date);
    console.log("Initial date object:", dateObj);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    console.log("Start of day:", startOfDay);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    console.log("End of day:", endOfDay);
    
    // Query with the date range
    const showtimes = await showtimeModel
      .find({
        movie: movieId,
        date: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate("movie")
      .populate("hall");
      
    console.log("Showtimes found:", showtimes.length);
    return showtimes;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
};