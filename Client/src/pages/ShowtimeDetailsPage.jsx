import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import SeatMap from "../components/booking/SeatMap";
import { userShowtimeService } from "../services/api";
import "../styles/pages/ShowtimeDetailsPage.css";

const ShowtimeDetailsPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        setLoading(true);
        const response = await userShowtimeService.getShowtimeDetails(showtimeId);
        const showtimeData = response.showtime || response;
        // Fetch available seats
        let seats = [];
        try {
          const seatsRes = await userShowtimeService.getAvailableSeats(showtimeId);
          const rawSeats = seatsRes.seats || seatsRes || [];
          seats = (Array.isArray(rawSeats) ? rawSeats : []).map((s, i) => {
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
        } catch (_) {}
        setShowtime({ ...showtimeData, seats });
        setError(null);
      } catch (err) {
        console.error("Showtime details fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load showtime details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShowtime();
  }, [showtimeId]);

  const handleSeatSelect = (nextSelected) => {
    // SeatMap provides the entire next selection array
    setSelectedSeats(nextSelected);
  };

  const handleProceedToBooking = () => {
    navigate(`/booking/${showtimeId}`, {
      state: { selectedSeats },
    });
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

  if (!showtime) {
    return (
      <div className="error-container">
        <Alert severity="warning">Showtime not found.</Alert>
      </div>
    );
  }

  return (
    <Container className="showtime-details-container">
      <Box className="header-section">
        <Typography variant="h4" className="title">
          Select Your Seats
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          {(showtime.movie?.title || showtime.movieName || "")} - {(() => {
            try {
              if (showtime.time) {
                const [h, m] = String(showtime.time).split(":");
                const d = new Date();
                d.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0, 0, 0);
                return format(d, "h:mm a");
              }
              if (showtime.startTime) return format(new Date(showtime.startTime), "h:mm a");
            } catch {}
            return showtime.time || "";
          })()}
        </Typography>
      </Box>

      <Box className="screen-section">
        <div className="screen-bar" />
        <Typography variant="body2" className="screen-label">
          SCREEN
        </Typography>
      </Box>

      <Box className="seats-section">
        <SeatMap
          seats={showtime.seats || []}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelect}
        />
      </Box>

      <Box className="legend-section">
        <div className="legend-item">
          <div className="seat-sample available" />
          <Typography>Available</Typography>
        </div>
        <div className="legend-item">
          <div className="seat-sample selected" />
          <Typography>Selected</Typography>
        </div>
        <div className="legend-item">
          <div className="seat-sample booked" />
          <Typography>Booked</Typography>
        </div>
      </Box>

      <Box className="booking-summary">
        <Typography variant="h6" className="summary-title">
          Booking Summary
        </Typography>
        <Typography className="seats-count">
          Selected Seats: {selectedSeats.length}
        </Typography>
        <Typography className="total-amount">
          Total Amount: ${((selectedSeats.length || 0) * (showtime.price || 0)).toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={selectedSeats.length === 0}
          onClick={handleProceedToBooking}
          className="proceed-button"
        >
          Proceed to Payment
        </Button>
      </Box>
    </Container>
  );
};

export default ShowtimeDetailsPage;
