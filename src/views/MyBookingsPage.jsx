import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/user/booking", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // Only show bookings that are not used (isUsed !== true)
        const allBookings = res.data.booking || res.data.bookings || [];
        setBookings(allBookings.filter((b) => !b.isUsed));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      {bookings.length === 0 ? (
        <Typography>No active bookings found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking.bookingId}>
              <Paper
                sx={{ p: 2, cursor: "pointer" }}
                onClick={() => navigate(`/booking/${booking.bookingId}`)}
              >
                <Typography variant="h6">
                  {booking.movieTitle || "Movie Title"}
                </Typography>
                <Typography>
                  Date: {new Date(booking.showtimeDate).toLocaleDateString()}
                </Typography>
                <Typography>Time: {booking.showtimeTime}</Typography>
                <Typography>
                  Seats:{" "}
                  {booking.reservedSeats?.map((s) => s.rowLabel).join(", ")}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MyBookingsPage;
