import * as bookingSchema from "../models/index.js";
import * as hallSchema from "../models/index.js";
import * as showtimeSchema from "../models/index.js";
import * as seatSchema from "../models/index.js";
import * as userSchema from "../models/index.js";
import * as movieSchema from "../models/index.js";
import { db } from "./dbConfig.js";
import { and, eq, inArray } from "drizzle-orm";
import { ApiError, SQLError } from "../utils/errorHandler.js";
import { UUID } from "crypto";

const bookingDB = bookingSchema.bookingSchema;
const showtimeDB = showtimeSchema.showtimeSchema;
const hallDB = hallSchema.hallSchema;
const seatDB = seatSchema.seatSchema;
const userDB = userSchema.userSchema;
const movieDB = movieSchema.movieSchema;

export const checkSeatAvailability = async (
  showtimeId: UUID,
  seatIds: any[]
) => {
  try {
    // Unrealistic seat IDs can be passed since SQL returns empty data for invalid IDs instead of throwing an error
    const validSeats = await db
      .select({ id: seatDB.seatsTable.id })
      .from(seatDB.seatsTable)
      .where(inArray(seatDB.seatsTable.id, seatIds));

    if (validSeats.length !== seatIds.length) {
      throw new ApiError("One or more seat IDs are invalid", 400);
    }

    // Now after we checked for real seat IDs, check if they are available or already booked
    const bookedSeats = await db
      .select()
      .from(bookingDB.bookingSeatTable)
      .where(
        and(
          eq(bookingDB.bookingSeatTable.showtimeId, showtimeId),
          inArray(bookingDB.bookingSeatTable.seatId, seatIds)
        )
      );

    if (bookedSeats.length > 0) {
      throw new ApiError("One or more selected seats are already booked.", 400);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (
  userId: UUID,
  showtimeId: UUID,
  seatIds: any[],
  showtimePrice: number
) => {
  try {
    const totalPrice = showtimePrice * seatIds.length;

    const booking = await db
      .insert(bookingDB.bookingTable)
      .values({
        userId,
        showtimeId,
        totalPrice,
      })
      .returning();
    if (!booking[0]) {
      throw new SQLError(500, "Failed to create booking.");
    }

    return booking[0];
  } catch (error) {
    throw error;
  }
};

export const confirmBooking = async (bookingId: number) => {
  try {
    const booking = await db
      .update(bookingDB.bookingTable)
      .set({ isBooked: true })
      .where(eq(bookingDB.bookingTable.id, bookingId))
      .returning();

    if (!booking[0]) {
      throw new SQLError(
        500,
        "Failed to confirm booking. Contact support if money was deducted."
      );
    }
    return booking[0];
  } catch (error) {
    throw error;
  }
};

export const addSeatsToBooking = async (
  bookingId: number,
  showtimeId: UUID,
  seatIds: any[]
) => {
  try {
    const bookingSeats = await Promise.all(
      seatIds.map(async (seatId) =>
        db
          .insert(bookingDB.bookingSeatTable)
          .values({
            bookingId,
            showtimeId,
            seatId,
          })
          .returning()
      )
    );
    // console.log("bookingSeats: ", bookingSeats);

    return bookingSeats;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId: number) => {
  try {
    const deletedBooking = await db
      .delete(bookingDB.bookingTable)
      .where(eq(bookingDB.bookingTable.id, bookingId))
      .returning();

    if (!deletedBooking[0]) {
      throw new SQLError("Booking not found", 404);
    }

    return deletedBooking[0];
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (id: number) => {
  try {
    const bookedSeats = await db
      .select({ seatId: bookingDB.bookingSeatTable.seatId })
      .from(bookingDB.bookingSeatTable)
      .where(eq(bookingDB.bookingSeatTable.bookingId, id));

    const seatIds = bookedSeats.map((seat) => seat.seatId);
    // console.log("seatIds: ", seatIds);

    const booking = await db
      .select({
        id: bookingDB.bookingTable.id,
        userId: bookingDB.bookingTable.userId,
        userName: userDB.usersTable.name,
        showtimeId: bookingDB.bookingTable.showtimeId,
        showtimeTime: showtimeDB.showtimesTable.time,
        showtimeDate: showtimeDB.showtimesTable.date,
        movieId: showtimeDB.showtimesTable.movieId,
        movieTitle: movieDB.moviesTable.title,
        hallId: showtimeDB.showtimesTable.hallId,
        hallName: hallDB.hallsTable.name,
        totalprice: bookingDB.bookingTable.totalPrice,
        createdAt: bookingDB.bookingTable.createdAt,
      })
      .from(bookingDB.bookingTable)
      .where(eq(bookingDB.bookingTable.id, id))
      .leftJoin(
        userDB.usersTable,
        eq(bookingDB.bookingTable.userId, userDB.usersTable.id)
      )
      .leftJoin(
        showtimeDB.showtimesTable,
        eq(bookingDB.bookingTable.showtimeId, showtimeDB.showtimesTable.id)
      )
      .leftJoin(
        movieDB.moviesTable,
        eq(showtimeDB.showtimesTable.movieId, movieDB.moviesTable.id)
      )
      .leftJoin(
        hallDB.hallsTable,
        eq(showtimeDB.showtimesTable.hallId, hallDB.hallsTable.id)
      )
      .leftJoin(
        bookingDB.bookingSeatTable,
        eq(bookingDB.bookingTable.id, bookingDB.bookingSeatTable.bookingId)
      )
      .limit(1);

    console.log("booking: ", booking);

    if (!booking[0]) {
      throw new ApiError("Booking not found", 404);
    }

    const reservedSeats = await Promise.all(
      seatIds.map(async (seatId) => {
        const seat = await db
          .select({ rowLabel: seatDB.seatsTable.rowLabel})
          .from(seatDB.seatsTable)
          .where(eq(seatDB.seatsTable.id, seatId))
          .limit(1);
        return seat[0];
      })
    )

    return { ...booking[0], reservedSeats };
  } catch (error) {
    throw error;
  }
};

export const getUserBookings = async (userId: UUID) => {
  try {
    const bookings = await db
      .select({
        bookingId: bookingDB.bookingTable.id,
        userId: bookingDB.bookingTable.userId,
        userName: userDB.usersTable.name,
        showtimeId: bookingDB.bookingTable.showtimeId,
        showtimeTime: showtimeDB.showtimesTable.time,
        showtimeDate: showtimeDB.showtimesTable.date,
        movieId: showtimeDB.showtimesTable.movieId,
        movieTitle: movieDB.moviesTable.title,
        hallId: showtimeDB.showtimesTable.hallId,
        hallName: hallDB.hallsTable.name,
        totalprice: bookingDB.bookingTable.totalPrice,
        createdAt: bookingDB.bookingTable.createdAt,
      })
      .from(bookingDB.bookingTable)
      .where(
        and(
          eq(bookingDB.bookingTable.userId, userId),
          eq(bookingDB.bookingTable.isBooked, true)
        )
      )
      .leftJoin(
        userDB.usersTable,
        eq(bookingDB.bookingTable.userId, userDB.usersTable.id)
      )
      .leftJoin(
        showtimeDB.showtimesTable,
        eq(bookingDB.bookingTable.showtimeId, showtimeDB.showtimesTable.id)
      )
      .leftJoin(
        movieDB.moviesTable,
        eq(showtimeDB.showtimesTable.movieId, movieDB.moviesTable.id)
      )
      .leftJoin(
        hallDB.hallsTable,
        eq(showtimeDB.showtimesTable.hallId, hallDB.hallsTable.id)
      );

    if (!bookings[0] || bookings.length === 0) {
      throw new ApiError("Bookings not found", 404);
    }

    const bookingsWithSeats = await Promise.all(
      bookings.map(async (booking) => {
        const bookedSeats = await db
          .select()
          .from(bookingDB.bookingSeatTable)
          .where(eq(bookingDB.bookingSeatTable.bookingId, booking.bookingId));

        const seatIds = bookedSeats.map((seat) => seat.seatId);

        const reservedSeats = await Promise.all(
          seatIds.map(async (seatId) => {
            const seat = await db
              .select({ rowLabel: seatDB.seatsTable.rowLabel })
              .from(seatDB.seatsTable)
              .where(eq(seatDB.seatsTable.id, seatId))
              .limit(1);
            return seat[0];
          })
        );

        return { reservedSeats };
      })
    );

    return { bookings, bookingsWithSeats };
    
  } catch (error) {
    throw error;
  }
}
