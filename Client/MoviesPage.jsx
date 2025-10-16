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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("/user/movies");
        setMovies(res.data.movies || res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
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
        Movies
      </Typography>
      <Grid container spacing={3}>
        {movies.length === 0 && <Typography>No movies available.</Typography>}
        {movies.map((movie) => (
          <Grid item xs={12} md={6} lg={4} key={movie._id}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {movie.title}
                </Typography>
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    style={{
                      width: 120,
                      height: "auto",
                      marginBottom: 8,
                      borderRadius: 4,
                    }}
                  />
                )}
                <Typography variant="body2">
                  Genres: {movie.genres?.join(", ")}
                </Typography>
                <Typography variant="body2">
                  Director: {movie.director}
                </Typography>
                <Typography variant="body2">
                  Release Date:{" "}
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString()
                    : "N/A"}
                </Typography>
                <Typography variant="body2">
                  Description: {movie.description || "N/A"}
                </Typography>
                {movie.ratings && movie.ratings.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Ratings:
                    </Typography>
                    {movie.ratings.map((r, idx) => (
                      <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                        {r.site}: {r.score}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/booking?movieId=${movie._id}`)}
                  >
                    Book Ticket
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Movie Details Modal/Section */}
      {selectedMovie && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: "#fafafa",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {selectedMovie.title}
          </Typography>
          {selectedMovie.posterUrl && (
            <img
              src={selectedMovie.posterUrl}
              alt={selectedMovie.title}
              style={{
                width: 180,
                height: "auto",
                marginBottom: 8,
                borderRadius: 4,
              }}
            />
          )}
          <Typography variant="body1" sx={{ mb: 1 }}>
            Genres: {selectedMovie.genres?.join(", ")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Director: {selectedMovie.director}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Release Date:{" "}
            {selectedMovie.releaseDate
              ? new Date(selectedMovie.releaseDate).toLocaleDateString()
              : "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Description: {selectedMovie.description || "N/A"}
          </Typography>
          {selectedMovie.ratings && selectedMovie.ratings.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" fontWeight={500}>
                Ratings:
              </Typography>
              {selectedMovie.ratings.map((r, idx) => (
                <Typography key={idx} variant="body1" sx={{ ml: 1 }}>
                  {r.site}: {r.score}
                </Typography>
              ))}
            </Box>
          )}
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/booking?movieId=${selectedMovie._id}`)}
            >
              Book Ticket
            </Button>
            <Button variant="outlined" onClick={() => setSelectedMovie(null)}>
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MoviesPage;
