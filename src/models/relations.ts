import { relations } from "drizzle-orm";
import * as hallSchema from "./hallSchema";
import * as seatSchema from "./seatSchema";
import * as movieSchema from "./movieSchema";
import * as showtimeSchema from "./showtimeSchema";


export const hallRelation = relations(hallSchema.hallsTable, ({ many }) => ({
    seats: many(seatSchema.seatsTable),
    showtimes: many(showtimeSchema.showtimesTable),
}))

export const seatRelation = relations(seatSchema.seatsTable, ({ one }) => ({
    hall: one(hallSchema.hallsTable, {
        fields: [seatSchema.seatsTable.hall],
        references: [hallSchema.hallsTable.id]
    }),
}))

export const movieRelation = relations(movieSchema.moviesTable, ({ many }) => ({
    showtimes: many(showtimeSchema.showtimesTable),
}))

export const showtimeRelation = relations(showtimeSchema.showtimesTable, ({ one }) => ({
    movie: one(movieSchema.moviesTable, {
        fields: [showtimeSchema.showtimesTable.movieId],
        references: [movieSchema.moviesTable.id]
    }),
    hall: one(hallSchema.hallsTable, {
        fields: [showtimeSchema.showtimesTable.hallId],
        references: [hallSchema.hallsTable.id]
    }),
}))