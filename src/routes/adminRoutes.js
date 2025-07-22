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

const router = express.Router();

// Movie routes
router.get("/movie/:id", authMiddleware, restrictTo("admin"), getMovie);
router.get("/movies", authMiddleware, restrictTo("admin"), getAllMovies);
router.post("/movie", authMiddleware, restrictTo("admin"), postMovie);
router.put("/movie/:id", authMiddleware, restrictTo("admin"), putMovie);
router.delete("/movie/:id", authMiddleware, restrictTo("admin"), deleteMovie);
router.delete("/movies", authMiddleware, restrictTo("admin"), deleteAllMovies);

// Hall routes
router.post("/hall", authMiddleware, restrictTo("admin"), postHall);
router.get("/halls", authMiddleware, restrictTo("admin"), getHalls);
router.get("/hall/:id", authMiddleware, restrictTo("admin"), getHall);
router.put("/hall/:id", authMiddleware, restrictTo("admin"), putHall);
router.delete("/hall/:id", authMiddleware, restrictTo("admin"), deleteHall);
router.delete("/halls", authMiddleware, restrictTo("admin"), deleteAllHalls);

// Showtime routes
router.post("/showtime", authMiddleware, restrictTo("admin"), postShowtime);
router.get("/showtimes", authMiddleware, restrictTo("admin"), getShowtimes);
router.get("/showtime/:id", authMiddleware, restrictTo("admin"), getShowtime);
router.put("/showtime/:id", authMiddleware, restrictTo("admin"), putShowtime);
router.delete(
  "/showtime/:id",
  authMiddleware,
  restrictTo("admin"),
  deleteShowtime
);
router.delete(
  "/showtimes",
  authMiddleware,
  restrictTo("admin"),
  deleteAllShowtimes
);

export default router;
