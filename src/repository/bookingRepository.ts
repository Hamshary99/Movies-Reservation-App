import * as bookingSchema from "../models/index.js";
import * as hallSchema from "../models/index.js";
import * as showtimeSchema from "../models/index.js";
import * as seatSchema from "../models/index.js";
import * as userSchema from "../models/index.js";
import * as movieSchema from "../models/index.js";
import { db } from "./dbConfig.js";
import { and, eq, inArray, sql } from "drizzle-orm";
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to check seat availability.",
      error.statusCode || 500,
      error.sqlMessage || "SQL_error"
    );
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to create booking.",
      error.statusCode || 500,
      error.sqlMessage || "SQL_error"
    );
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to confirm booking.",
      error.statusCode || 500,
      error.sqlMessage || "SQL_error"
    );
  }
};

export const addPaymentId = async (bookingId: number, paymentId: string) => {
  try {
    const updatedBooking = await db
      .update(bookingDB.bookingTable)
      .set({ paymentId })
      .where(eq(bookingDB.bookingTable.id, bookingId))
      .returning();

    return updatedBooking[0];
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to add payment ID.",
      error.statusCode || 500,
      error.sqlMessage || "SQL_error"
    );
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to add seats to booking.",
      error.statusCode || 500,
      error.sqlMessage || "SQL_error"
    );
  }
};

export const getBookingById = async (BookingId: number, userId: UUID) => {
  try {
    const bookedSeats = await db
      .select({ seatId: bookingDB.bookingSeatTable.seatId })
      .from(bookingDB.bookingSeatTable)
      .where(eq(bookingDB.bookingSeatTable.bookingId, BookingId));

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
        isUsed: bookingDB.bookingTable.isUsed,
        isBooked: bookingDB.bookingTable.isBooked,
        paymentId: bookingDB.bookingTable.paymentId,
      })
      .from(bookingDB.bookingTable)
      .where(eq(bookingDB.bookingTable.id, BookingId))
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
      );

    // console.log("booking: ", booking);
    if (!booking[0]) {
      throw new ApiError("Booking not found", 404);
    }
    
    if(booking[0].userId !== userId) {
      throw new ApiError("You do not have permission to view this booking", 403);
    }
    
    
    const reservedSeats = await Promise.all(
      seatIds.map(async (seatId) => {
        const [seat] = await db
          .select({ id: seatDB.seatsTable.id, rowLabel: seatDB.seatsTable.rowLabel })
          .from(seatDB.seatsTable)
          .where(eq(seatDB.seatsTable.id, seatId))
          .limit(1);
        return seat;
      })
    );

    return { ...booking[0], reservedSeats };
  } catch (error : any) {
    throw new SQLError(
      error.message || "Failed to fetch booking",
      error.statusCode || 500,
      "SQL_error"
    );
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to fetch bookings",
      error.statusCode || 500,
      "SQL_error"
    );
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
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to cancel booking",
      error.statusCode || 500,
      "SQL_error"
    );
  }
};

export const revokeBookingAfterRefund = async (bookingId: number) => {
  try {
    const updatedBooking = await db
      .update(bookingDB.bookingTable)
      .set({ isBooked: false })
      .where(eq(bookingDB.bookingTable.id, bookingId))
      .returning();

    if (!updatedBooking[0]) {
      throw new SQLError("Booking not found", 404);
    }

    const bookingSeats = await db
      .delete(bookingDB.bookingSeatTable)
      .where(eq(bookingDB.bookingSeatTable.bookingId, bookingId))
      .returning();

    if (!updatedBooking[0]) {
      throw new SQLError("Booking not found", 404);
    }

    return {
      updatedBooking: updatedBooking[0],
      bookingSeats: bookingSeats[0],
    };
  } catch (error: any) {
    throw new SQLError(
      error.message || "Failed to revoke booking",
      error.statusCode || 500,
      "SQL_error"
    );
  }
};
