import express from "express";
import {
  getProfile,
  putProfile,
  deleteProfile,
  // getShowtimes,
  getShowtime,
  getShowtimesByMovieAndDate,
  getShowtimesOfMovie,
  postBooking,
  getBooking,
  getAllUserBookings,
  putBooking,
  deleteBooking,
  getAvailableSeatsForShowtime,
  getMovie,
  getMovies
} from "../controllers/userController.js";

import {
    authMiddleware,
    restrictTo
} from "../middleware/auth.js";

const router = express.Router();

router.get('/profile/:id', authMiddleware, restrictTo("user", "admin"), getProfile);
router.put('/profile/:id', authMiddleware, restrictTo("user"), putProfile);
router.delete('/profile/:id', authMiddleware, restrictTo("user"), deleteProfile);
// router.get("/showtimes", getShowtimes); unncessary and redundant, only good for debugging
router.get('/showtime/:id', getShowtime);
router.get('/showtime', getShowtimesOfMovie);
router.get('/showtime/:id/seats', getAvailableSeatsForShowtime);

// Booking routes
router.post('/booking', authMiddleware, restrictTo("user"), postBooking);
router.get('/booking/:id', authMiddleware, restrictTo("user"), getBooking);
router.get('/booking', authMiddleware, restrictTo("user"), getAllUserBookings);
router.put('/booking/:id', authMiddleware, restrictTo("user"), putBooking);
router.delete('/booking/:id', authMiddleware, restrictTo("user"), deleteBooking);

router.get('/movies', getMovies);
router.get('/movies/:id', getMovie);
router.get('/movies/:movieId/showtimes/:date', getShowtimesByMovieAndDate);



export default router;
