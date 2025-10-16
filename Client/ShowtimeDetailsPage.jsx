import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

function ShowtimeDetailsPage() {
  const { showtimeId } = useParams();
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hallSeats, setHallSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatError, setSeatError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtime = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/user/showtime/${showtimeId}`);
        setShowtime(res.data.showtime || res.data);
      } catch (err) {
        setError("Failed to fetch showtime details.");
      } finally {
        setLoading(false);
      }
    };
    fetchShowtime();
  }, [showtimeId]);

  useEffect(() => {
    const fetchSeats = async () => {
      setSeatError("");
      if (!showtimeId) {
        setHallSeats([]);
        return;
      }
      try {
        const res = await axios.get(`/user/showtime/${showtimeId}/seats`);
        let seats = [];
        if (Array.isArray(res.data)) {
          seats = res.data;
        } else if (Array.isArray(res.data.seats)) {
          seats = res.data.seats;
        } else if (res.data.data && Array.isArray(res.data.data.seats)) {
          seats = res.data.data.seats;
        }
        setHallSeats(seats);
      } catch (err) {
        setHallSeats([]);
        setSeatError(err.response?.data?.message || "Failed to load seats for this showtime.");
      }
    };
    fetchSeats();
  }, [showtimeId]);

  function SeatPicker() {
    if (seatError) return <Alert severity="error">{seatError}</Alert>;
    if (!hallSeats || hallSeats.length === 0)
      return <Typography>No seats found for this showtime.</Typography>;
    // Group seats by row for display
    const rows = {};
    hallSeats.forEach((seat) => {
      const rowLabel = String.fromCharCode(65 + (seat.row - 1));
      if (!rows[rowLabel]) rows[rowLabel] = [];
      rows[rowLabel].push(seat);
    });
    return (
      <Box sx={{ mt: 2 }}>
        {/* Big screen visual */}
        <Box
          sx={{
            width: '80%',
            mx: 'auto',
            mb: 3,
            height: 24,
            background: 'linear-gradient(90deg, #eee 0%, #ccc 100%)',
            borderRadius: '0 0 40px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 18,
            color: '#888',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            letterSpacing: 2,
          }}
        >
          SCREEN
        </Box>
        {Object.keys(rows)
          .sort()
          .map((rowLabel) => (
            <Box
              key={rowLabel}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {rows[rowLabel]
                .sort((a, b) => a.column - b.column)
                .map((seat) => {
                  const isReserved = seat.reserved || seat.booked;
                  return (
                    <Button
                      key={seat._id}
                      variant={
                        selectedSeats.includes(seat._id)
                          ? "contained"
                          : "outlined"
                      }
                      color={
                        selectedSeats.includes(seat._id)
                          ? "success"
                          : isReserved
                          ? "inherit"
                          : "primary"
                      }
                      size="small"
                      sx={{
                        minWidth: 32,
                        minHeight: 32,
                        m: 0.5,
                        bgcolor: isReserved ? "#ccc" : undefined,
                        color: isReserved ? "#888" : undefined,
                        borderColor: isReserved ? "#bbb" : undefined,
                        cursor: isReserved ? "not-allowed" : undefined,
                      }}
                      disabled={isReserved}
                      onClick={() => {
                        if (isReserved) return;
                        setSelectedSeats((seats) =>
                          seats.includes(seat._id)
                            ? seats.filter((s) => s !== seat._id)
                            : [...seats, seat._id]
                        );
                      }}
                    >
                      {seat.label || `${rowLabel}${seat.column}`}
                    </Button>
                  );
                })}
            </Box>
          ))}
      </Box>
    );
  }

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  if (!showtime) return null;

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {showtime.movie?.title} - {showtime.time} in {showtime.hall?.name}
        </Typography>
        <Typography>Date: {new Date(showtime.date).toLocaleDateString()}</Typography>
        <Typography>Price: ${showtime.price}</Typography>
        <SeatPicker />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedSeats.length === 0}
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.post(
                  "/user/booking",
                  {
                    showtimeId: showtime._id,
                    seatId: selectedSeats,
                  },
                  { headers }
                );
                const bookingId = res.data.booking?._id || res.data._id;
                if (!bookingId) {
                  alert("Booking succeeded but booking ID is missing!");
                  console.log("Booking response:", res.data);
                  return;
                }
                navigate(`/booking/${bookingId}`);
              } catch (err) {
                alert(err.response?.data?.message || "Booking failed");
              }
            }}
          >
            Book Selected Seats
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ShowtimeDetailsPage;
