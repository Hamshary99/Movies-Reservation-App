import {
  createMovie,
  createHall,
  createShowtime,
} from "../services/adminServices/postAdminServices.js";

import {
  fetchMovie,
  fetchAllMovies,
  fetchHall,
  fetchAllHalls,
  fetchShowtime,
  fetchAllShowtimes,
  fetchSeatsOfHall
} from "../services/adminServices/getAdminServices.js";

import {
  updateMovie,
  updateHall,
  updateShowtime,
} from "../services/adminServices/putAdminServices.js";

import {
  removeMovie,
  removeAllMovies,
  removeHall,
  removeAllHalls,
  removeShowtime,
  removeAllShowtimes,
} from "../services/adminServices/deleteAdminServices.js";
import { response } from "express";


export const postMovie = async (req, res, next) => {
  try {
    const createdMovie = await createMovie(req.body);
    res
      .status(201)
      .json({ message: "Movie created successfully", movie: createdMovie });
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    const getMovie = await fetchMovie(req.params.id);
    return res
      .status(200)
      .json({
        status: "success",
        message: "Movie fetched successfully",
        movie: getMovie
      });
  } catch (error) {
    next(error);
  }
};

export const getAllMovies = async (req, res, next) => {
  try {
    const getAllMovies = await fetchAllMovies();
    res
      .status(200)
      .json({
        status: "success",
        message: "All movies fetched successfully",
        movie: getAllMovies
      });
  } catch (error) {
    next(error);
  }
};

export const putMovie = async (req, res, next) => {
  try {
    const updatedMovie = await updateMovie(req.params.id, req.body);
    res
      .status(200)
      .json({
        status: "success",
        message: "Movie updated successfully",
        movie: updatedMovie
      });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const removedmovie = await removeMovie(req.params.id);
    res
      .status(204)
      .json({
        status: "success",
        message: "Movie deleted successfully",
        movie: removedmovie
      });
  } catch (error) {
    next(error);
  }
};

export const deleteAllMovies = async (req, res, next) => {
  try {
    const deletedMovies = await removeAllMovies();
    res
      .status(204)
      .json({
        status: "success",
        message: "All movies deleted successfully",
        movie: deletedMovies
      });
  } catch (error) {
    next(error);
  }
};

export const postHall = async (req, res, next) => {
  try {
    const { hall, seats } = await createHall(req.body);
    res
      .status(201)
      .json({
        status: "success",
        message: "Hall created successfully",
        hall,
        seats
      });
  } catch (error) {
    next(error);
  }
};

export const getHalls = async (req, res, next) => {
  try {
    const halls = await fetchAllHalls();
    res
      .status(200)
      .json({
        status: "success",
        message: "All halls fetched successfully",
        hall: halls,
        seats: null
      });
  } catch (error) {
    next(error);
  }
};

export const getHall = async (req, res, next) => {
  try {
    const { hall, seats } = await fetchHall(req.params.id);
    // const seatsOfHall = seats.map((seat) => seat._id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Hall fetched successfully",
        hall,
        seats
      });
  } catch (error) {
    next(error);
  }
};

export const putHall = async (req, res, next) => {
  try {
    const { hall, seats } = await updateHall(req.params.id, req.body);
    
    res
      .status(200)
      .json({
        status: "success",
        message: "Hall updated successfully",
        hall,
        seats
      });
  } catch (error) {
    next(error);
  }
};

export const deleteHall = async (req, res, next) => {
  try {
    const { hall, seats } = await removeHall(req.params.id);
    res
      .status(204)
      .send({
        status: "success",
        message: "Hall deleted successfully",
        hall,
        seats: null
      });
  } catch (error) {
    next(error);
  }
};

export const deleteAllHalls = async (req, res, next) => {
  try {
    const deletedHalls = await removeAllHalls();
    res
      .status(204)
      .json({
        status: "success",
        message: "All halls deleted successfully",
        hall: deletedHalls,
        seats: null
      });
  } catch (error) {
    next(error);
  }
};

export const postShowtime = async (req, res, next) => {
  try {
    const showtime = await createShowtime(req.body);
    res
      .status(201)
      .json({
        status: "success",
        message: "Showtime created successfully",
        showtime
      });
  } catch (error) {
    next(error);
  }
};

export const getShowtimes = async (req, res, next) => {
  try {
    const showtimes = await fetchAllShowtimes();
    res.status(200).json({
      status: "success",
      message: "All showtimes fetched successfully",
      showtime: showtimes
    });
  } catch (error) {
    next(error);
  }
};

export const getShowtime = async (req, res, next) => {
  try {
    const showtime = await fetchShowtime(req.params.id);
    res
      .status(200)
      .json({
        status: "success",
        message: "Showtime fetched successfully",
        showtime
      });
  } catch (error) {
    next(error);
  }
};

export const putShowtime = async (req, res, next) => {
  try {
    const updatedShowtime = await updateShowtime(req.params.id, req.body);
    res
      .status(200)
      .json({
        status: "success",
        message: "Showtime updated successfully",
        showtime: updatedShowtime
      });
  } catch (error) {
    next(error);
  }
};

export const deleteShowtime = async (req, res, next) => {
  try {
    const deletedShowtime = await removeShowtime(req.params.id);
    res
      .status(204)
      .send({
        status: "success",
        message: "Showtime deleted successfully",
        showtime: deletedShowtime
      });
  } catch (error) {
    next(error);
  }
};

export const deleteAllShowtimes = async (req, res, next) => {
  try {
    const deletedShowtimes = await removeAllShowtimes();
    res
      .status(204)
      .json({
        status: "success",
        message: "All showtimes deleted successfully",
        showtime: deletedShowtimes
      });
  } catch (error) {
    next(error);
  }
};
