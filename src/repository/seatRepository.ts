import * as seatSchema from "../models/index.js";
import * as showtimeSchema from "../models/index.js";
import * as bookingSchema from "../models/index.js";
import * as hallSchema from "../models/index.js";
import { db } from "./dbConfig.js";
import { eq, and, isNull } from "drizzle-orm";
import { SQLError } from "../utils/errorHandler.js";

const seatDB = seatSchema.seatSchema;
const bookingDB = bookingSchema.bookingSchema;
const hallDB = hallSchema.hallSchema;

export const getSeatsByHallId = async (hallId: number) => {
  try {
    const seats = await db
      .select()
      .from(seatDB.seatsTable)
      .where(eq(seatDB.seatsTable.hall, hallId));

    if (seats.length === 0) {
      return [];
    }
    return seats;
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to get seats",
      error.statusCode || 500,
      error.sqlMessage || "sql_error"
    );
  }
};


export const getSeatsOfHall = async (hallId: number) => {
  try {
    const seats = await db
      .select({
        id: seatDB.seatsTable.id,
        label: seatDB.seatsTable.rowLabel,
        hallId: seatDB.seatsTable.hall,
        hall: hallDB.hallsTable.name 
      })
      .from(seatDB.seatsTable)
      .leftJoin(hallDB.hallsTable, eq(seatDB.seatsTable.hall, hallDB.hallsTable.id))
      .where(eq(seatDB.seatsTable.hall, hallId));

    if (seats.length === 0) {
      return [];
    }
    return seats;
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to get seats",
      error.statusCode || 500,
      error.sqlMessage || "sql_error"
    );
  }
}


export const getAvailableSeatsForShowtime = async (
  showtimeId: string,
  hallId: number
) => {
  try {
    const availableSeats = await db
      .select({
        id: seatDB.seatsTable.id,
        label: seatDB.seatsTable.rowLabel,
        hall: seatDB.seatsTable.hall,
      })
      .from(seatDB.seatsTable)
      .leftJoin(
        bookingDB.bookingSeatTable,
        and(
          eq(bookingDB.bookingSeatTable.seatId, seatDB.seatsTable.id),
          eq(bookingDB.bookingSeatTable.showtimeId, showtimeId)
        )
      )
      .where(
        and(
          eq(seatDB.seatsTable.hall, hallId),
          isNull(bookingDB.bookingSeatTable.seatId)
        )
      );

    if (availableSeats.length === 0) {
      return [];
    }

    // Flattened and formatted directly
    const formattedSeats = availableSeats.map((seat) => ({
      id: seat.id,
      label: seat.label,
      hall: `Hall_${seat.hall}`,
      hallId: seat.hall,
    }));

    return formattedSeats;
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to get available seats",
      error.statusCode || 500,
      error.sqlMessage || "sql_error"
    );
  }
};
