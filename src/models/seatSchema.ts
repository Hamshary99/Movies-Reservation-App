import {
  serial,
  text,
  pgTable,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import * as hallSchema from "./hallSchema";

export const seatsTable = pgTable("seats", {
  id: serial("id").primaryKey(),
  seatLabel: text("seatLabel").notNull(),
  hall: integer("halls")
    .notNull()
    .references(() => hallSchema.hallsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export type Seat = typeof seatsTable.$inferSelect;
export type newSeat = typeof seatsTable.$inferInsert;

export const seatInsertSchema = {
  rowLabel: text("seat_number").notNull(),
  hall: integer("halls").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  booked: boolean("booked").default(false).notNull(),
};