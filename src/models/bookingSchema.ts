import { z } from "zod";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  foreignKey,
  primaryKey,
  index,
  real,
  unique,
} from "drizzle-orm/pg-core";

import * as userSchema from "./userSchema";
import * as showtimeSchema from "./showtimeSchema";
import * as seatSchema from "./seatSchema";

import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";

export const bookingTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => userSchema.usersTable.id).notNull(),
  showtimeId: uuid("showtime_id").references(() => showtimeSchema.showtimesTable.id).notNull(),
  // seats: text("seats").array().references(() => seatSchema.seatsTable.id).notNull(),
  totalPrice: real("total_price").notNull(),
  isBooked: boolean("booked").default(false).notNull(),
  isUsed: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingSeatTable = pgTable("booking_seats", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookingTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
  showtimeId: uuid("showtime_id")
    .notNull()
    .references(() => showtimeSchema.showtimesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
  seatId: integer("seat_id")
    .notNull()
    .references(() => seatSchema.seatsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
},
  (t) => ({
    uniqueSeatPerShowtime: unique().on(t.showtimeId, t.seatId),
  })
);

export type Booking = typeof bookingTable.$inferSelect;
export type NewBooking = typeof bookingTable.$inferInsert;

export const bookingInsertSchema = createInsertSchema(bookingTable);
export const bookingUpdateSchema = createUpdateSchema(bookingTable);
export const bookingSelectSchema = createSelectSchema(bookingTable);

export const bookingCreateSchema = bookingInsertSchema
    .extend({
        userId: z.string().uuid("Invalid user ID"),
        showtimeId: z.string().uuid("Invalid showtime ID"),
        seats: z.array(z.string().min(1, "Seat identifier cannot be empty, at least 1 is required")),
    })


