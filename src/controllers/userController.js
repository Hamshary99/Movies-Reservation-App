import {
  fetchProfile,
  fetchShowtime,
  fetchAllShowtimes,
  fetchBooking,
  fetchAllUserBookings,
  fetchAvailableSeatsForShowtime
} from "../services/userServices/getUserServices.js";

import {
  postBookingTicket,
} from "../services/userServices/postUserServices.js";

import {
  updateProfile,
  updateBooking,
} from "../services/userServices/putUserServices.js";

import { deleteBookingTicket } from "../services/userServices/deleteUserServices.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = fetchProfile(req.query.id || req.params.id);
    res
      .status(200)
      .json({ message: "User profile fetched successfully", user });
  } catch (error) {
    next(error);
  }
};

export const putProfile = async (req, res, next) => {
  try {
    const updatedUser = await updateProfile(req.params.id || req.query.id, req.body, req.user._id, req.user.role);
    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getShowtimes = async (req, res, next) => {
  try {
    const showtimes = await fetchAllShowtimes();
    res.status(200).json({ message: "All showtimes fetched successfully", showtime: showtimes });
  } catch (error) {
    next(error);
  }
};

export const getShowtime = async (req, res, next) => {
  try {
    const showtime = await fetchShowtime(req.params.id);
    res.status(200).json({ message: "Showtime fetched successfully", showtime: showtime });
  } catch (error) {
    next(error);
  }
};

export const postBooking = async (req, res, next) => {
  try {
    const booking = await postBookingTicket(req.body, req.user._id);
    res
      .status(201)
      .json({ message: "Ticket reserved successfully", booking });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await fetchBooking(req.params.id || req.query.id);
    res.status(200).json({ message: "Booking fetched successfully", booking });
  } catch (error) {
    next(error);
  }
};

export const getAllUserBookings = async (req, res, next) => {
  try {
    // const userId = req.user._id;
    // // console.log("User ID:", userId);

    // const bookings = await bookingModel
    //   .find({ user: userId })
    //   .populate("showtime")
    //   .populate("seats")
    //   .populate("user");

    const bookings = await fetchAllUserBookings(req.user._id);
    res
      .status(200)
      .json({ message: "User bookings fetched successfully", booking: bookings });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSeatsForShowtime = async (req, res, next) => {
  try {
    const seats = await fetchAvailableSeatsForShowtime(req.params.id);
    res.status(200).json({ message: "Available seats fetched successfully", seats });
  } catch (error) {
    next(error);
  }
};

//Should never update a booking when it's 72h before the showtime
export const putBooking = async (req, res) => {
  try {
    // const { bookingId } = req.params || req.query; // Get booking ID from params or query
    // const { showtimeId, seatId } = req.body;
    // if (!bookingId) {
    //   return res.status(400).json({ message: "Booking ID is required" });
    // }

    // // Check ownership
    // const booking = await bookingModel.findById(bookingId);
    // if (!booking) {
    //   return res.status(404).json({ message: "Booking not found" });
    // }
    // if (booking.user.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json({ message: "You do not have permission to update this booking" });
    // }
    // // Always get the showtime date from the showtime referenced by the booking
    // const showtime = await showtimeModel.findById(booking.showtime);
    // if (!showtime) {
    //   return res.status(404).json({ message: "Showtime not found" });
    // }
    // if (new Date(showtime.date) - new Date() < 72 * 60 * 60 * 1000) {
    //   return res
    //     .status(400)
    //     .json({ message: "Cannot update booking 72h before showtime" });
    // }
    // if (booking.isUsed) {
    //   return res.status(400).json({ message: "Ticket has already been used" });
    // }
    // // Update booking
    // booking.showtime = showtimeId;
    // booking.seats = seatId;
    // await booking.save();

    const updatedBooking = await updateBooking(req.params.id, req.body, req.user._id);
    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await deleteBookingTicket(req.params.id, req.user._id);
    res
      .status(200)
      .json({ message: "Booking deleted successfully", booking: deletedBooking });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// To be used later
// export const ticketUsed = async (req, res) => {
//   try {
//     const { bookingId } = req.params || req.query; // Get booking ID from params or query
//     const booking = await bookingModel.findById(bookingId);
//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }
//     booking.isUsed = true;
//     await booking.save();
//     res.status(200).json({ message: "Ticket used successfully", booking });
//   }
//   catch (error) {
//     console.error("Error reserving ticket:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
