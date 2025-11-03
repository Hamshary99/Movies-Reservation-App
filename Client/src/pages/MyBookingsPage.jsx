import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/api";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingService.getUserBookings();
        const data = response?.data || response;

        const baseBookings =
          data?.booking?.bookings && Array.isArray(data.booking.bookings)
            ? data.booking.bookings
            : [];

        const seatInfo =
          data?.booking?.bookingsWithSeats &&
          Array.isArray(data.booking.bookingsWithSeats)
            ? data.booking.bookingsWithSeats
            : [];

        // Merge seats into each booking (by index)
        const merged = baseBookings.map((b, i) => ({
          ...b,
          reservedSeats:
            seatInfo[i]?.reservedSeats?.map((s) => s.rowLabel) || [],
        }));

        setBookings(merged);
      } catch (err) {
        console.error("Fetch bookings failed:", err);
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Container>
        <Box textAlign="center" py={4}>
          <Typography variant="h5" gutterBottom>
            No Bookings Found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/movies")}
            sx={{ mt: 2 }}
          >
            Browse Movies
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 4 }}>
        My Bookings
      </Typography>
      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid item xs={12} md={6} key={booking.bookingId || booking._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎬 {booking.movieTitle || "Unknown Movie"}
                </Typography>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={formatDate(booking.showtimeDate)}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={
                      booking.showtimeTime
                        ? booking.showtimeTime.slice(0, 5)
                        : "No time"
                    }
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={booking.hallName || "Unknown Hall"}
                    size="small"
                    color="secondary"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seats:{" "}
                  {booking.reservedSeats.length > 0
                    ? booking.reservedSeats.join(", ")
                    : "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Amount: ${booking.totalprice?.toFixed(2) || "0.00"}
                </Typography>

                <Box mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(`/booking/${booking.bookingId || booking._id}`)
                    }
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyBookingsPage;
