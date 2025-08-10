import express from "express";

import {
    authMiddleware,
    restrictTo
} from "../middleware/auth.js";

import {
  scanTicketQR,
  getBookingDetails,
  getShowtimes,
  getShowtime,
} from "../controllers/receptionController.js";

const router = express.Router();

router.get('/scanTicketQR', authMiddleware, restrictTo('receptionist'), scanTicketQR);
router.get('/bookingDetails/:id', authMiddleware, restrictTo('receptionist'), getBookingDetails);
router.get('/showtimes', authMiddleware, restrictTo('receptionist'), getShowtimes);
router.get('/showtime/:id', authMiddleware, restrictTo('receptionist'), getShowtime);
