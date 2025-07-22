import React, { useEffect, useState } from "react";
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
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          <b>Movie:</b> {booking.showtime?.movie?.title}
        </Typography>
        <Typography>
          <b>Hall:</b> {booking.showtime?.hall?.name}
        </Typography>
        <Typography>
          <b>Date:</b> {new Date(booking.showtime?.date).toLocaleDateString()}
        </Typography>
        <Typography>
          <b>Time:</b> {booking.showtime?.time}
        </Typography>
        <Typography>
          <b>Seats:</b> {Array.isArray(booking.seats) && booking.seats.length > 0
            ? booking.seats.map(seat => seat.label || seat._id || seat).join(", ")
            : "-"}
        </Typography>
        <Typography>
          <b>Price:</b> ${booking.showtime?.price}
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate("/showtimes")}
        >
          Back to Showtimes
        </Button>
      </Paper>
    </Box>
  );
}

export default BookingDetailsPage;
