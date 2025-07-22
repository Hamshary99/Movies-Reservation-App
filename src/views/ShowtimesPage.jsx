import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of seat ObjectIds
  const [hallSeats, setHallSeats] = useState([]); // All seat docs for the selected hall
  const [seatError, setSeatError] = useState(""); // Error for seat fetching
  const navigate = useNavigate();
  const location = useLocation();

  // Read showtimeId from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const showtimeId = params.get("showtimeId");
    if (showtimeId && showtimes.length > 0) {
      const found = showtimes.find(s => s._id === showtimeId);
      if (found) {
        setSelectedMovie(found.movie?._id || "");
        setSelectedDay(new Date(found.date));
        setSelectedShowtime(found);
      }
    }
  }, [location.search, showtimes]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await axios.get("/user/showtimes");
        setShowtimes(res.data.showtime || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load showtimes.");
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, []);

  useEffect(() => {
    const fetchSeats = async () => {
      setSeatError("");
      if (!selectedShowtime?._id) {
        setHallSeats([]);
        return;
      }
      try {
        const res = await axios.get(
          `/user/showtime/${selectedShowtime._id}/seats`
        );
        console.log("Seats API response:", res.data);
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
  }, [selectedShowtime]);

  // Get unique movies from showtimes
  const movies = Array.from(
    new Map(showtimes.map((s) => [s.movie?._id, s.movie])).values()
  );

  // Filter showtimes by selected movie and day
  let filteredShowtimes = showtimes;
  if (selectedMovie) {
    filteredShowtimes = filteredShowtimes.filter(
      (s) => s.movie?._id === selectedMovie
    );
  }
  if (selectedDay) {
    const dayStr = selectedDay.toISOString().slice(0, 10);
    filteredShowtimes = filteredShowtimes.filter(
      (s) => s.date.slice(0, 10) === dayStr
    );
  }

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  // Helper to render seat picker for a hall using real seat docs
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Showtimes
      </Typography>
      {/* Movie Picker */}
      {!selectedShowtime && (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="movie-select-label">Select Movie</InputLabel>
            <Select
              labelId="movie-select-label"
              value={selectedMovie}
              label="Select Movie"
              onChange={(e) => {
                setSelectedMovie(e.target.value);
                setSelectedDay(null);
              }}
            >
              {movies.map((movie) => (
                <MenuItem key={movie._id} value={movie._id}>
                  {movie.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Day Picker */}
          {selectedMovie && (
            <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
              {getNext7Days().map((day) => (
                <Button
                  key={day.toISOString()}
                  variant={
                    selectedDay &&
                    selectedDay instanceof Date &&
                    day.toDateString() === selectedDay.toDateString()
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setSelectedDay(day)}
                >
                  {day.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Button>
              ))}
            </Box>
          )}

          {/* Showtimes List */}
          <Grid container spacing={3}>
            {selectedMovie && selectedDay && filteredShowtimes.length === 0 && (
              <Typography>No showtimes available for this day.</Typography>
            )}
            {selectedMovie &&
              selectedDay &&
              filteredShowtimes.map((show) => (
                <Grid item xs={12} md={6} lg={4} key={show._id}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Time: {show.time}</Typography>
                    <Typography>Hall: {show.hall?.name || "N/A"}</Typography>
                    <Typography>Price: ${show.price}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSelectedShowtime(show);
                        setSelectedSeats([]);
                      }}
                    >
                      Pick Seats
                    </Button>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Seat Picker for selected showtime */}
      {selectedShowtime && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Pick your seats for {selectedShowtime.movie?.title} -{" "}
            {selectedShowtime.time} in {selectedShowtime.hall?.name}
          </Typography>
          <SeatPicker />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => setSelectedShowtime(null)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={selectedSeats.length === 0}
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};
                  const res = await axios.post(
                    "/user/booking",
                    {
                      showtimeId: selectedShowtime._id,
                      seatId: selectedSeats,
                    },
                    { headers }
                  );
                  // Redirect to booking details page (assume booking._id is returned)
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
        </Box>
      )}
    </Box>
  );
}

export default ShowtimesPage;
