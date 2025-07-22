import express from "express";
import {
  getProfile,
  putProfile,
  getShowtimes,
  getShowtime,
  postBooking,
  getBooking,
  getAllUserBookings,
  putBooking,
  deleteBooking,
  getAvailableSeatsForShowtime
} from "../controllers/userController.js";

import {
    authMiddleware,
    restrictTo
} from "../middleware/auth.js";

const router = express.Router();

router.get("/profile/:id", authMiddleware, restrictTo("user", "admin"), getProfile);
router.put("/profile/:id", authMiddleware, restrictTo("user", "admin"), putProfile);
router.get("/showtimes", getShowtimes);
router.get("/showtime/:id", getShowtime);
router.get("/showtime/:id/seats", getAvailableSeatsForShowtime);

// Booking routes
router.post("/booking", authMiddleware, restrictTo("user"), postBooking);
router.get("/booking/:id", authMiddleware, restrictTo("user"), getBooking);
router.get("/booking", authMiddleware, restrictTo("user"), getAllUserBookings);
router.put("/booking/:id", authMiddleware, restrictTo("user"), putBooking);
// router.put("/booking/:id/confirm", authMiddleware, restrictTo("user"), confirmBooking);
router.delete("/booking/:id", authMiddleware, restrictTo("user"), deleteBooking);

export default router;
