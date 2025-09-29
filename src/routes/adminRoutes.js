import express from "express";
import {
  postMovie,
  getMovie,
  getAllMovies,
  putMovie,
  deleteMovie,
  deleteAllMovies,
  postHall,
  getHalls,
  getHall,
  putHall,
  deleteHall,
  deleteAllHalls,
  postShowtime,
  getShowtimes,
  getShowtime,
  putShowtime,
  deleteShowtime,
  deleteAllShowtimes,
} from "../controllers/adminController.js";

import { authMiddleware, restrictTo } from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";
import * as schemas from "../models/index.js"

const router = express.Router();

// Movie routes
router.get("/movie/:id", authMiddleware, restrictTo("admin"), getMovie);
router.get("/movie", authMiddleware, restrictTo("admin"), getAllMovies);
router.post("/movie", authMiddleware, restrictTo("admin"), validate(schemas.movieSchema.movieCreateSchema),postMovie);
router.put("/movie/:id", authMiddleware, restrictTo("admin"), validate(schemas.movieSchema.movieEditSchema), putMovie);
router.delete("/movie/:id", authMiddleware, restrictTo("admin"), deleteMovie);
router.delete("/movie", authMiddleware, restrictTo("admin"), deleteAllMovies);

// Hall routes
router.post("/hall", authMiddleware, restrictTo("admin"), validate(schemas.hallSchema.hallDataVerify), postHall);
router.get("/hall", authMiddleware, restrictTo("admin"), getHalls);
router.get("/hall/:id", authMiddleware, restrictTo("admin"), getHall);
router.put("/hall/:id", authMiddleware, restrictTo("admin"), validate(schemas.hallSchema.hallDataVerify), putHall);
router.delete("/hall/:id", authMiddleware, restrictTo("admin"), deleteHall);
router.delete("/hall", authMiddleware, restrictTo("admin"), deleteAllHalls);

// Showtime routes
router.post("/showtime", authMiddleware, restrictTo("admin"), validate(schemas.showtimeSchema.showtimeCreateSchema), postShowtime);
router.get("/showtime", authMiddleware, restrictTo("admin"), getShowtimes);
router.get("/showtime/:id", authMiddleware, restrictTo("admin"), getShowtime);
router.put("/showtime/:id", authMiddleware, restrictTo("admin"), validate(schemas.showtimeSchema.showtimeEditSchema), putShowtime);
router.delete("/showtime/:id", authMiddleware, restrictTo("admin"), deleteShowtime);
router.delete("/showtime", authMiddleware, restrictTo("admin"), deleteAllShowtimes);

export default router;
