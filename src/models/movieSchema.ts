import { z } from "zod";
import {
    uuid,
    text,
    timestamp,
    pgTable,
    PgArray,
    pgEnum,
    boolean,
    jsonb,
    integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";
import { dir } from "console";


export const moviesTable = pgTable("movies", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    releaseDate: integer("release_date"),
    genres: text("genres").array().notNull(),
    ratings: jsonb("ratings").$type<{ source: string; score: number }[] | null>(),
    description: text("description"),
    posterUrl: text("poster_url"),
    director: text("director"),
})

export type Movie = typeof moviesTable.$inferSelect;
export type NewMovie = typeof moviesTable.$inferInsert;

export const movieInsertSchema = createInsertSchema(moviesTable);
export const movieUpdateSchema = createUpdateSchema(moviesTable);
export const movieSelectSchema = createSelectSchema(moviesTable);

export const movieCreateSchema = movieInsertSchema
    .extend({
        title: z.string().min(1, "Title is required"),
        releaseDate: z.number().min(1888, "Invalid release year").optional(),
        genres: z.array(z.string()).min(1, "At least one genre is required"),
        ratings: z.array(z.object({ source: z.string(), score: z.number() })).optional(),
        description: z.string().optional(),
        posterUrl: z.string().url("Invalid URL").optional(),
        director: z.string().min(1, "Director is required"),
    })

export const movieEditSchema = movieUpdateSchema
    .extend({
        title: z.string().min(1, "Title is required").optional(),
        releaseDate: z.number().min(1888, "Invalid release year").optional(),
        genres: z.array(z.string()).min(1, "At least one genre is required").optional(),
        ratings: z.array(z.object({ source: z.string(), score: z.number() })).optional(),
        description: z.string().optional(),
        posterUrl: z.string().url("Invalid URL").optional(),
        director: z.string().min(1, "Director is required").optional(),
    })