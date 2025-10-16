import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function BookingDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservedSeats, setReservedSeats] = useState([]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/user/booking/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBooking(res.data.booking || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // If showtime is missing movie or hall, fetch them
  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      if (
        booking &&
        booking.showtime &&
        (!booking.showtime.movie || !booking.showtime.hall) &&
        booking.showtime._id
      ) {
        try {
          const res = await axios.get(`/user/showtime/${booking.showtime._id}`);
          setBooking((prev) => ({
            ...prev,
            showtime: { ...prev.showtime, ...res.data.showtime, ...res.data },
          }));
        } catch (err) {
          // ignore, just don't show extra info
        }
      }
    };
    fetchShowtimeDetails();
  }, [booking]);

  const handleReserveSeat = async (seatId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/user/booking/${id}/reserve-seat`,
        {
          seatId,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setReservedSeats((prev) => [...prev, seatId]);
      setBooking((prev) => ({
        ...prev,
        seats: [...prev.seats, seatId],
      }));
      navigate(-1); // Navigate to previous page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reserve seat.");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!booking) return null;

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Booking Details
        </Typography>
        <Typography>
          <b>Movie:</b> {booking.showtime?.movie?.title || "-"}
        </Typography>
        <Typography>
          <b>Hall:</b> {booking.showtime?.hall?.name || "-"}
        </Typography>
        <Typography>
          <b>Date:</b> {new Date(booking.showtime?.date).toLocaleDateString()}
        </Typography>
        <Typography>
          <b>Time:</b> {booking.showtime?.time}
        </Typography>
        <Typography>
          <b>Seats:</b>{" "}
          {Array.isArray(booking.seats) && booking.seats.length > 0
            ? booking.seats
                .map((seat) => seat.label || seat._id || seat)
                .join(", ")
            : "-"}
        </Typography>
        <Typography>
          <b>Price:</b> ${booking.showtime?.price}
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => history.goBack()}
        >
          Back to Previous Page
        </Button>
        {booking.showtime?.seats?.map((seat) => (
          <Button
            key={seat._id}
            sx={{ mt: 1 }}
            variant="contained"
            onClick={() => handleReserveSeat(seat._id)}
          >
            Reserve Seat {seat.label}
          </Button>
        ))}
      </Paper>
    </Box>
  );
}

export default BookingDetailsPage;
