import * as movieSchema from "../models/movieSchema";
import { db } from "./dbConfig.js";
import { eq } from "drizzle-orm";
import { ApiError, SQLError } from "../utils/errorHandler.js";

// We don't really mind if the movie already exists
export const createMovie = async (movieData: movieSchema.NewMovie) => {
    try {
        console.log("Creating movie: ", movieData);
        const movie = await db
            .insert(movieSchema.moviesTable)
            .values(movieData)
            .returning();
        
        if (!movie[0]) {
            throw new SQLError("Failed to create movie", 500, "SQL_error");
        }
        return movie[0];
    } catch (error) {
        throw error;
    }
};

export const getMovieById = async (id: string) => {
    try {
        const movie = await db
            .select()
            .from(movieSchema.moviesTable)
            .where(eq(movieSchema.moviesTable.id, id))
            .limit(1);
        if (!movie[0]) {
            throw new ApiError("Movie not found", 404);
        }
        return movie[0];
    } catch (error) {
        throw error;
    }
};

export const getMovieByTitle = async (title: string) => {
    try {
        const movie = await db
            .select()
            .from(movieSchema.moviesTable)
            .where(eq(movieSchema.moviesTable.title, title))
            .limit(1);
        return movie[0];
    } catch (error) {
        throw error;
    }
};

export const getAllMovies = async () => {
    try {
        const movies = await db.select().from(movieSchema.moviesTable);
        if (!movies) {
            throw new ApiError("Movies not found", 404);
        }
        return movies;
    } catch (error) {
        throw error;
    }
};

export const updateMovieById = async (id: string, updateData: Partial<movieSchema.NewMovie>) => {
    try {
        const [updatedMovie] = await db
            .update(movieSchema.moviesTable)
            .set(updateData)
            .where(eq(movieSchema.moviesTable.id, id))
            .returning();
        if (!updatedMovie) {
            throw new ApiError("Movie not found", 404);
        }
        console.log("Updated Movie: ", updatedMovie);
        return updatedMovie;
    } catch (error) {
        throw error;
    }
}

export const deleteMovieById = async (id: string) => {
    try {
        const deletedMovie = await db
            .delete(movieSchema.moviesTable)
            .where(eq(movieSchema.moviesTable.id, id))
            .returning();
        if (!deletedMovie[0]) {
            throw new ApiError("Movie not found", 404);
        }
        return deletedMovie[0];
    } catch (error) {
        throw error;
    }
};

export const deleteAllMovies = async () => {
    try {
        const deletedMovies = await db.delete(movieSchema.moviesTable).returning();
        return deletedMovies;
    } catch (error) {
        throw error;
    }
};