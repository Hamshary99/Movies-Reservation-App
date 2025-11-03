import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { movieService } from "../services/api";
import DatePicker from "../components/movies/DatePicker";
import ShowtimesList from "../components/movies/ShowtimesList";
import MovieInfo from "../components/movies/MovieInfo";
import "../styles/pages/MovieDetailsPage.css";

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const movieResponse = await movieService.getMovie(movieId);
        setMovie(movieResponse.data.movie);

        // Fetch showtimes for the selected date
        await fetchShowtimes(selectedDate);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  const fetchShowtimes = async (date) => {
    try {
      const showtimesResponse = await movieService.getShowtimesByDate(
        movieId,
        date
      );
      setShowtimes(showtimesResponse.data.showtimes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load showtimes");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchShowtimes(date);
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error-container">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box className="error-container">
        <Alert severity="info">Movie not found</Alert>
      </Box>
    );
  }

  return (
    <div className="movie-details-page">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <MovieInfo movie={movie} />
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Select Showtime
          </Typography>

          <DatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          <ShowtimesList
            showtimes={showtimes}
            movieId={movieId}
            selectedDate={selectedDate}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default MovieDetailsPage;
