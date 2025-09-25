import { z } from "zod";
import {
    uuid,
    text,
    timestamp,
    pgTable,
    pgEnum,
    boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-zod";


export const moviesTable = pgTable("movies", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    releaseDate: timestamp("release_date").notNull(),
    // genres: pgArray(text("genres")).notNull(),
    // ratings: pgArray(text("ratings")).notNull(),
    description: text("description"),
    posterUrl: text("poster_url")
})