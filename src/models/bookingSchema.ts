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
} from "drizzle-orm/pg-core";

import * as userSchema from "./userSchema";
import * as showtimeSchema from "./showtimeSchema";

import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";

export const bookingTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => userSchema.usersTable.id).notNull(),
  showtimeId: uuid("showtime_id").references(() => showtimeSchema.showtimesTable.id).notNull(),
  seats: text("seats").array().notNull(),
  totalPrice: real("total_price").notNull(),
  isBooked: boolean("booked").default(false).notNull(),
  isUsed: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
        totalPrice: z.number().min(0, "Total price must be a positive number"),
        isBooked: z.boolean().optional(),
        isUsed: z.boolean().optional(),
        createdAt: z.date().optional(),
    })
