import * as showtimeSchema from "../models/showtimeSchema.js";
import { db } from "./dbConfig.js";
import { eq, and } from "drizzle-orm";
import { ApiError, SQLError } from "../utils/errorHandler.js";


import * as movieSchema from "../models/movieSchema.js";
import * as hallSchema from "../models/hallSchema.js";
import { UUID } from "crypto";

export const createShowtime = async (
  showtimeData: showtimeSchema.NewShowtime
) => {
  try {
    const newShowtime = await db
      .insert(showtimeSchema.showtimesTable)
      .values(showtimeData)
      .returning();

    if (!newShowtime[0]) {
      throw new SQLError("Failed to create showtime", 500, "SQL_error");
    }
    return newShowtime[0];
  } catch (error) {
    throw error;
  }
};

export const getShowtimeById = async (id: UUID) => {
  try {
    console.log("Fetching showtime with ID:", id);
    const showtime = await db
      .select({
        id: showtimeSchema.showtimesTable.id,
        movieId: showtimeSchema.showtimesTable.movieId,
        movieName: movieSchema.moviesTable.title,
        hallId: showtimeSchema.showtimesTable.hallId,
        hallName: hallSchema.hallsTable.name,
        time: showtimeSchema.showtimesTable.time,
        date: showtimeSchema.showtimesTable.date,
        price: showtimeSchema.showtimesTable.price,
      })
      .from(showtimeSchema.showtimesTable)
      .where(eq(showtimeSchema.showtimesTable.id, id))
      .leftJoin(movieSchema.moviesTable, eq(showtimeSchema.showtimesTable.movieId, movieSchema.moviesTable.id))
      .leftJoin(hallSchema.hallsTable, eq(showtimeSchema.showtimesTable.hallId, hallSchema.hallsTable.id))
      .limit(1);
    
    console.log("showtime: ", showtime);
      
      
    if (!showtime[0]) {
      throw new ApiError("Showtime not found", 404);
    }
    return showtime[0];
  } catch (error) {
    throw error;
  }
};

export const checkShowtimeAvailability = async (
  date: string,
  time: string
) => {
  try {
    const showtime = await db
      .select()
      .from(showtimeSchema.showtimesTable)
      .where(
        and(
          eq(showtimeSchema.showtimesTable.date, date),
          eq(showtimeSchema.showtimesTable.time, time)
        )
      )
      .limit(1);
    return showtime[0];
  } catch (error) {
    throw error;
  }
};

export const getAllShowtimesForMovie = async (movieId: string) => {
  try {
    const showtimes = await db
      .select({
        id: showtimeSchema.showtimesTable.id,
        movieId: showtimeSchema.showtimesTable.movieId,
        movieName: movieSchema.moviesTable.title,
        hallId: showtimeSchema.showtimesTable.hallId,
        hallName: hallSchema.hallsTable.name,
        time: showtimeSchema.showtimesTable.time,
        date: showtimeSchema.showtimesTable.date,
        price: showtimeSchema.showtimesTable.price,
      })
      .from(showtimeSchema.showtimesTable)
      .where(eq(showtimeSchema.showtimesTable.movieId, movieId))
      .leftJoin(movieSchema.moviesTable, eq(showtimeSchema.showtimesTable.movieId, movieSchema.moviesTable.id))
      .leftJoin(hallSchema.hallsTable, eq(showtimeSchema.showtimesTable.hallId, hallSchema.hallsTable.id));
    
    if (!showtimes[0]) {
      throw new ApiError("Showtimes not found", 404);
    }
    return showtimes;
  } catch (error) {
    throw error;
  }
};

export const getAllShowtimes = async () => {
  try {
    const showtimes = await db.select().from(showtimeSchema.showtimesTable);
    return showtimes;
  } catch (error) {
    throw error;
  }
};

export const updateShowtimeById = async (
  id: string,
  showtimeData: Partial<showtimeSchema.Showtime>
) => {
  try {
    const updatedShowtime = await db
      .update(showtimeSchema.showtimesTable)
      .set(showtimeData)
      .where(eq(showtimeSchema.showtimesTable.id, id))
      .returning();

    if (!updatedShowtime[0]) {
      throw new ApiError("Failed to update showtime", 404);
    }
    return updatedShowtime[0];
  } catch (error) {
    throw error;
  }
};

export const deleteShowtimeById = async (id: string) => {
  try {
    const deletedShowtime = await db
      .delete(showtimeSchema.showtimesTable)
      .where(eq(showtimeSchema.showtimesTable.id, id))
      .returning();
    if (!deletedShowtime[0]) {
      throw new ApiError("Showtime not found", 404);
    }
    return deletedShowtime[0];
  } catch (error) {
    throw error;
  }
};

export const deleteShowtimesByMovieId = async (movieId: string) => {
  try {
    const deletedShowtimes = await db
      .delete(showtimeSchema.showtimesTable)
      .where(eq(showtimeSchema.showtimesTable.movieId, movieId))
      .returning();
    return deletedShowtimes;
  } catch (error) {
    throw error;
  }
};

export const deleteShowtimesByHallId = async (hallId: number) => {
  try {
    const deletedShowtimes = await db
      .delete(showtimeSchema.showtimesTable)
      .where(eq(showtimeSchema.showtimesTable.hallId, hallId))
      .returning();
    return deletedShowtimes;
  } catch (error) {
    throw error;
  }
};

export const deleteAllShowtimes = async () => {
  try {
    const deletedShowtimes = await db
      .delete(showtimeSchema.showtimesTable)
      .returning();
    return deletedShowtimes;
  } catch (error) {
    throw error;
  }
};
