import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as seatRepository from "../../repository/seatRepository.js";
import { cacheWrapper } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { ApiError } from "../../utils/errorHandler.js";

export const fetchMovie = async (id) => {
  try {
    if (!id) {
      throw new ApiError("Movie ID is required", 400);
    }
    const movie = await cacheWrapper(cacheKeys.movie(id), async () => {
      const dbMovie = await movieRepository.getMovieById(id);
      if (!dbMovie) {
        throw new ApiError("Movie not found", 404);
      }
      return dbMovie;
    })
    return movie;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch movies",
      error.statusCode || 500
    );
  }
};


export const fetchAllMovies = async () => {
  try {
    const movie = await cacheWrapper(cacheKeys.allMovies(), async () => {
      const dbMovies = await movieRepository.getAllMovies();
      if (!dbMovies) {
        throw new ApiError("Movies not found", 404);
      }
      return dbMovies;
    })
    return movie;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const { hall, seats } = await cacheWrapper(cacheKeys.hall(id), async () => {
      const dbHall = await hallRepository.getHall(id);
      if (!dbHall) {
        throw new ApiError("Hall not found", 404);
      }
      return dbHall;
    })

    return { hall, seats };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch hall",
      error.statusCode || 500
    );
  }
};

export const fetchAllHalls = async () => {
  try {
    const halls = await cacheWrapper(cacheKeys.allHalls(), async () => {
      const dbHalls = await hallRepository.getHalls();
      if (!dbHalls) {
        throw new ApiError("Halls not found", 404);
      }
      return dbHalls;
    })
    return halls;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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

    const showtime = await cacheWrapper(cacheKeys.showtime(id), async () => {
      const dbShowtime = await showtimeRepository.getShowtimeById(id);
      if (!dbShowtime) {
        throw new ApiError("Showtime not found", 404);
      }
      return dbShowtime;
    })

    return showtime;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtime",
      error.statusCode || 500
    );
  }
};

export const fetchAllShowtimes = async () => {
  try {
    const showtimes = await cacheWrapper(cacheKeys.allShowtimes(), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimes();
      if (!dbShowtimes) {
        throw new ApiError("Showtimes not found", 404);
      }
      return dbShowtimes;
    })
    return showtimes;
  } catch (error) {
    if (error instanceof ApiError) throw error;
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
    const seatsOfHall = await cacheWrapper(cacheKeys.seatsOfHall(id), async () => {
      const dbSeats = await seatRepository.getSeatsOfHall(id);
      if (!dbSeats) {
        throw new ApiError("Seats not found", 404);
      }
      return dbSeats;
    })
    return seatsOfHall;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || "Failed to fetch showtimes",
      error.statusCode || 500
    );
  }
}