import * as hallRepository from "../../repository/hallRepository.js";
import * as movieRepository from "../../repository/movieRepository.js";
import * as showtimeRepository from "../../repository/showtimeRepository.js";
import * as seatRepository from "../../repository/seatRepository.js";
import { cacheWrapper } from "../../utils/cache.js";
import { cacheKeys } from "../../utils/cacheKeys.js";
import { ApiError } from "../../utils/errorHandler.js";
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


export const fetchMovie = async (movieId) => {
  try {
    if (!movieId) {
      logger.warn("Movie ID is missing in fetchMovie", { movieId });
      throw new ApiError("Movie ID is required", 400);
    }
    logger.debug("Fetching movie", { movieId });
    const movie = await cacheWrapper(cacheKeys.movie(movieId), async () => {
      const dbMovie = await movieRepository.getMovieById(movieId);
      if (!dbMovie) {
        logger.warn("Movie not found", { movieId });
        throw new ApiError("Movie not found", 404);
      }
      return dbMovie;
    })
    return movie;
  } catch (error) {
    handleServiceError("Failed to fetch movie", error, { movieId });
  }
};


export const fetchAllMovies = async () => {
  try {
    const movie = await cacheWrapper(cacheKeys.allMovies(), async () => {
      const dbMovies = await movieRepository.getAllMovies();
      if (!dbMovies) {
        logger.warn("Movies not found");
        throw new ApiError("Movies not found", 404);
      }
      return dbMovies;
    })
    return movie;
  } catch (error) {
    handleServiceError("Failed to fetch movies", error);
  }
};

export const fetchHall = async (hallId) => {
  try {
    if (!hallId) {
      throw new ApiError("Hall ID is required", 400);
    }

    logger.debug("Fetching hall", { hallId });
    const { hall, seats } = await cacheWrapper(cacheKeys.hall(hallId), async () => {
      const dbHall = await hallRepository.getHall(hallId);
      if (!dbHall) {
        logger.warn("Hall not found", { hallId });
        throw new ApiError("Hall not found", 404);
      }
      return dbHall;
    });

    logger.debug("Fetched hall seats", { hallId, seats, seatsCount: seats.length });

    return { hall, seats };
  } catch (error) {
    handleServiceError("Failed to fetch hall", error, { hallId });
  }
};

export const fetchAllHalls = async () => {
  try {
    const halls = await cacheWrapper(cacheKeys.allHalls(), async () => {
      const dbHalls = await hallRepository.getHalls();
      if (!dbHalls) {
        logger.warn("Halls not found");
        throw new ApiError("Halls not found", 404);
      }
      return dbHalls;
    })
    return halls;
  } catch (error) {
    handleServiceError("Failed to fetch halls", error);
  }
};

export const fetchShowtime = async (showtimeId) => {
  try {
    if (!showtimeId) {
      logger.warn("Showtime ID is missing in fetchShowtime", { showtimeId });
      throw new ApiError("Showtime ID is required", 400);
    }

    logger.debug("Fetching showtime", { showtimeId });
    const showtime = await cacheWrapper(cacheKeys.showtime(showtimeId), async () => {
      const dbShowtime = await showtimeRepository.getShowtimeById(showtimeId);
      if (!dbShowtime) {
        logger.warn("Showtime not found", { showtimeId });
        throw new ApiError("Showtime not found", 404);
      }
      return dbShowtime;
    })

    return showtime;
  } catch (error) {
    handleServiceError("Failed to fetch showtime", error, { showtimeId });
  }
};

export const fetchAllShowtimes = async () => {
  try {
    logger.debug("Fetching all showtimes");
    const showtimes = await cacheWrapper(cacheKeys.allShowtimes(), async () => {
      const dbShowtimes = await showtimeRepository.getAllShowtimes();
      if (!dbShowtimes) {
        logger.warn("Showtimes not found");
        throw new ApiError("Showtimes not found", 404);
      }
      return dbShowtimes;
    })
    return showtimes;
  } catch (error) {
    handleServiceError("Failed to fetch showtimes", error);
  }
};

export const fetchSeatsOfHall = async (hallId) => {
  try {
    if (!hallId) {
      logger.warn("Hall ID is missing in fetchSeatsOfHall", { hallId });
      throw new ApiError("Hall ID is required", 400);
    }

    logger.debug("Fetching seats of hall", { hallId });
    const seatsOfHall = await cacheWrapper(cacheKeys.seatsOfHall(hallId), async () => {
      const dbSeats = await seatRepository.getSeatsOfHall(hallId);
      if (!dbSeats) {
        logger.warn("Seats not found for hall", { hallId });
        throw new ApiError("Seats not found", 404);
      }
      return dbSeats;
    })
    return seatsOfHall;
  } catch (error) {
    handleServiceError("Failed to fetch seats of hall", error, { hallId });
  }
}