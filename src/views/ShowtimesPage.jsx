import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ShowtimesPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      try {
        // Fetch movie details
        const movieRes = await axios.get(`/user/movies/${movieId}`);
        setMovie(movieRes.data.movie);

        // Generate next 7 days
        const nextDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        setDates(nextDays);
        setSelectedDate(nextDays[0]);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load movie details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [movieId]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);
        const res = await axios.get(
          `/user/movies/${movieId}/showtimes/${selectedDate}`
        );
        setShowtimes(res.data.showtimes || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load showtimes.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId, selectedDate]);

  const handleDateChange = (event, newValue) => {
    setSelectedDate(dates[newValue]);
  };

  const handleShowtimeClick = (showtimeId) => {
    navigate(`/showtimes/${showtimeId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 4 }}>
      {movie && (
        <>
          <Typography variant="h4" gutterBottom>
            {movie.title} - Showtimes
          </Typography>

          <Tabs
            value={dates.indexOf(selectedDate)}
            onChange={handleDateChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            {dates.map((date, index) => (
              <Tab
                key={date}
                label={new Date(date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              />
            ))}
          </Tabs>

          {showtimes.length === 0 ? (
            <Typography>No showtimes available for this date.</Typography>
          ) : (
            <Grid container spacing={3}>
              {showtimes.map((showtime) => (
                <Grid item xs={12} sm={6} md={4} key={showtime._id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleShowtimeClick(showtime._id)}
                  >
                    <CardContent>
                      <Typography variant="h6">
                        {new Date(showtime.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      <Typography color="text.secondary">
                        Hall: {showtime.hallName}
                      </Typography>
                      <Typography color="text.secondary">
                        Available Seats: {showtime.availableSeats}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Book Seats
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

export default ShowtimesPage;
