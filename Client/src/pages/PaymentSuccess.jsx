import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { bookingService } from "../services/api";
import { format } from "date-fns";
import "../styles/pages/PaymentSuccess.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const bookingId = searchParams.get("bookingId");

      if (!sessionId && !bookingId) {
        setError("Invalid payment session");
        setLoading(false);
        return;
      }

      try {
        let response;
        if (sessionId) {
          response = await bookingService.verifyPayment(sessionId);
        } else {
          response = await bookingService.getBooking(bookingId);
        }

        // ✅ Handle backend shape: { message, booking: {...} }
        const data = response?.booking || response;
        setBooking(data);
      } catch (err) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="success-container">
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/movies")}
          className="action-button"
        >
          Browse Movies
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="success-container">
        <Alert severity="warning">No booking details available.</Alert>
      </Container>
    );
  }

  return (
    <Container className="success-container">
      <Paper className="success-paper">
        <div className="success-header">
          <Typography variant="h4" className="success-title">
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" className="success-subtitle">
            Thank you for your booking. Your payment has been processed
            successfully.
          </Typography>
        </div>

        <div className="booking-details">
          <Typography variant="h6" className="section-title">
            Booking Details
          </Typography>

          <div className="detail-item">
            <Typography variant="subtitle1">Movie:</Typography>
            <Typography>{booking.movieTitle || "N/A"}</Typography>
          </div>

          <div className="detail-item">
            <Typography variant="subtitle1">Date & Time:</Typography>
            <Typography>
              {booking.showtimeDate && booking.showtimeTime
                ? format(
                    new Date(`${booking.showtimeDate}T${booking.showtimeTime}`),
                    "PPpp"
                  )
                : "Date not available"}
            </Typography>
          </div>

          <div className="detail-item">
            <Typography variant="subtitle1">Hall:</Typography>
            <Typography>{booking.hallName || "N/A"}</Typography>
          </div>

          <div className="detail-item">
            <Typography variant="subtitle1">Seats:</Typography>
            <Typography>
              {Array.isArray(booking.reservedSeats)
                ? booking.reservedSeats.map((s) => s.rowLabel).join(", ")
                : "No seats found"}
            </Typography>
          </div>

          <div className="detail-item">
            <Typography variant="subtitle1">Booking ID:</Typography>
            <Typography>{booking.id || "N/A"}</Typography>
          </div>

          <div className="detail-item">
            <Typography variant="subtitle1">Amount Paid:</Typography>
            <Typography>
              {booking.totalprice ? `$${booking.totalprice.toFixed(2)}` : "N/A"}
            </Typography>
          </div>
        </div>

        <div className="ticket-info">
          <Typography variant="body2">
            An email with your booking confirmation and e-tickets has been sent
            to your registered email address.
          </Typography>
        </div>

        <div className="action-buttons">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="action-button"
          >
            View Booking Details
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/movies")}
            className="action-button"
          >
            Browse More Movies
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default PaymentSuccess;
