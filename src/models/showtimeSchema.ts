import { z } from "zod";
import {
  uuid,
  text,
  pgTable,
  jsonb,
  integer,
  time,
  date,
  serial,
  real,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createUpdateSchema,
  createSelectSchema,
} from "drizzle-zod";
import * as movieSchema from "./movieSchema";
import * as hallSchema from "./hallSchema";

export const showtimesTable = pgTable("showtimes", {
  id: uuid("id").primaryKey().defaultRandom(),
  movieId: uuid("movies")
    .references(() => movieSchema.moviesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  hallId: serial("halls")
    .references(() => hallSchema.hallsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  time: time("time").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  price: real("price").notNull(),
});

export type Showtime = typeof showtimesTable.$inferSelect;
export type NewShowtime = typeof showtimesTable.$inferInsert;

export const showtimeInsertSchema = createInsertSchema(showtimesTable);
export const showtimeUpdateSchema = createUpdateSchema(showtimesTable);
export const showtimeSelectSchema = createSelectSchema(showtimesTable);

export const showtimeCreateSchema = showtimeInsertSchema.extend({
  movieId: z.string().uuid("Invalid movie ID"),
  hallId: z.int("Invalid hall ID").positive("Hall ID must be positive"),
  time: z.string().nonempty("Time is required"),
  date: z.string().nonempty("Date is required"),
  price: z.number().positive("Price must be positive"),
});

export const showtimeEditSchema = showtimeUpdateSchema.extend({
  movieId: z.string().uuid("Invalid movie ID").optional(),
  hallId: z
    .int("Invalid hall ID")
    .positive("Hall ID must be positive")
    .optional(),
  time: z.string().nonempty("Time is required").optional(),
  date: z.string().nonempty("Date is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
});

export const showtimeFilterSchema = showtimeSelectSchema.extend({
  movieId: z.string().uuid("Invalid movie ID").optional(),
  hallId: z
    .int("Invalid hall ID")
    .positive("Hall ID must be positive")
    .optional(),
  date: z.string().nonempty("Date is required").optional(),
  time: z.string().nonempty("Time is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
});
