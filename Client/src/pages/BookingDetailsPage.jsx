import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import { userShowtimeService, userBookingService } from "../services/api";
import { loadStripe } from "@stripe/stripe-js";
import "../styles/pages/BookingDetailsPage.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedSeats = location.state?.selectedSeats || [];

  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        setLoading(true);
        // Fetch showtime core details
        const response = await userShowtimeService.getShowtimeDetails(bookingId);
        const showtimeData = response.showtime || response;
        setShowtime(showtimeData);
        // Fetch seats with availability/status
        try {
          const seatsRes = await userShowtimeService.getAvailableSeats(bookingId);
          const rawSeats = seatsRes.seats || seatsRes || [];
          const normalized = (Array.isArray(rawSeats) ? rawSeats : []).map((s, i) => {
            const rawRow = s.row || s.rowLabel || s.label || "R";
            const row = (String(rawRow).match(/[A-Za-z]+/)?.[0] || "R").toUpperCase();
            // Extract number from label (e.g., "A11" -> 11, "B3" -> 3)
            const numMatch = String(rawRow).match(/(\d+)/);
            const num = numMatch ? parseInt(numMatch[1], 10) : (parseInt(s.number ?? s.seatNumber ?? s.col ?? i + 1, 10) || (i + 1));
            // API returns seatId as the database ID field
            const backendId = s.seatId || s._id || s.id || s.seat_id || s.seatID;
            return {
              _id: backendId ? String(backendId) : `${row}${num}`,
              backendId: backendId ? String(backendId) : null,
              row,
              number: num,
              isBooked: Boolean(s.isBooked ?? s.booked ?? (s.isAvailable === false) ?? (s.available === false)),
            };
          });
          setSeats(normalized);
        } catch (_) {}
        setError(null);
      } catch (err) {
        console.error("Booking details fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load booking details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShowtime();
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      if (!selectedSeats || selectedSeats.length === 0) {
        throw new Error("Please select at least one seat");
      }

      const selectedSeat = seats.find((s) => {
        const label = `${s.row}${s.number}`;
        return selectedSeats.includes(s._id) || selectedSeats.includes(s.backendId) || selectedSeats.includes(label);
      });
      if (!selectedSeat) {
        throw new Error("Selected seat not found. Please reselect.");
      }

      const seatIds = selectedSeats
      .map((sel) => {
        const seat = seats.find(
          (s) =>
            sel === s._id ||
            sel === s.backendId ||
            sel === `${s.row}${s.number}`
        );
        if (!seat) return null;

        const isLabel = /^[A-Z]+\d+$/.test(seat._id || "");
        const rawId = seat.backendId || (!isLabel ? seat._id : null);
        if (!rawId) return null;

        return /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
      })
        .filter(Boolean);
      
      if (seatIds.length === 0) {
        console.error("Selected seats:", selectedSeats);
        console.error("All seats:", seats.slice(0, 5));
        throw new Error("No valid seats found. Please reselect.");
    }
      
      const response = await userBookingService.createBooking({
        showtimeId: bookingId,
        seatId: seatIds,
      });

      const paymentUrl = response?.paymentData?.paymentUrl || response?.paymentUrl;
      if (!paymentUrl) {
        console.error("Booking response:", response);
        throw new Error("No payment URL returned from server");
      }

      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!showtime || selectedSeats.length === 0) {
    return (
      <div className="error-container">
        <Alert severity="warning">Invalid booking details.</Alert>
      </div>
    );
  }

  const totalAmount = (selectedSeats.length || 0) * (showtime.price || 0);
  const availableSeatIds = new Set(seats.filter(s => !s.isBooked).map(s => s._id));
  const unavailableSelected = selectedSeats.filter(s => !availableSeatIds.has(s));

  return (
    <Container className="booking-details-container">
      <Paper className="booking-details-paper">
        <Typography variant="h4" className="page-title">
          Booking Details
        </Typography>

        <Box className="movie-info">
          <Typography variant="h5" className="movie-title">
            {showtime.movie?.title || showtime.movieName}
          </Typography>
          <Typography variant="subtitle1" className="showtime">
            {(() => {
              try {
                if (showtime.date && showtime.time) {
                  return `${showtime.date} ${showtime.time}`;
                }
                if (showtime.startTime) return format(new Date(showtime.startTime), "PPpp");
              } catch {}
              return showtime.time || "";
            })()}
          </Typography>
          <Typography variant="subtitle1" className="hall-name">
            {showtime.hall?.name || showtime.hallName}
          </Typography>
        </Box>

        <Divider className="divider" />

        <Box className="seats-info">
          <Typography variant="h6" className="section-title">
            Selected Seats
          </Typography>
          <Typography variant="body1" className="seats-list">
            {selectedSeats
              .map((id) => {
                const seat = seats.find((s) => s._id === id);
                return seat ? `${seat.row}${seat.number}` : id;
              })
              .join(", ")}
          </Typography>
          <Typography variant="subtitle1" className="seat-count">
            Total Seats: {selectedSeats.length}
          </Typography>
          {unavailableSelected.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              These seats are no longer available: {unavailableSelected.join(", ")}
            </Alert>
          )}
          <Divider className="divider" sx={{ my: 2 }} />
          <Typography variant="subtitle1" className="section-title">
            Availability Snapshot
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {seats.slice(0, 50).map((s) => (
              <Box key={s._id} sx={{ px: 1, py: 0.5, borderRadius: 1, fontSize: 12, bgcolor: s.isBooked ? "error.light" : "success.light", color: s.isBooked ? "error.contrastText" : "success.contrastText" }}>
                {s.row}{s.number}
              </Box>
            ))}
            {seats.length > 50 && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                +{seats.length - 50} more
              </Typography>
            )}
          </Box>
        </Box>

        <Divider className="divider" />

        <Box className="price-info">
          <Typography variant="h6" className="section-title">
            Price Details
          </Typography>
          <div className="price-row">
            <Typography>Price per ticket:</Typography>
            <Typography>${(showtime.price || 0).toFixed(2)}</Typography>
          </div>
          <div className="price-row total">
            <Typography variant="h6">Total Amount:</Typography>
            <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
          </div>
        </Box>

        <Box className="actions">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePayment}
            className="pay-button"
          >
            Proceed to Payment
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingDetailsPage;
