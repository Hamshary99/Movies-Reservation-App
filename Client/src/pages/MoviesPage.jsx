import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import { userMovieService } from "../services/api";
import "../styles/pages/MoviesPage.css";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await userMovieService.getAllMovies();
        // Handle both possible response structures
        const moviesData = response.movies || response || [];
        const uniqueMovies = [
          ...new Map(moviesData.map((movie) => [movie._id, movie])).values(),
        ];
        setMovies(uniqueMovies);
      } catch (err) {
        console.error("Movie fetch error:", err);
        setError(err.response?.data?.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movieId) => {
    // route in App.jsx is /movies/:movieId/showtimes (plural), use that
    navigate(`/movies/${movieId}/showtimes`);
  };

  return (
    <Box className="movies-container" sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Now Showing
      </Typography>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : movies.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No movies currently showing
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {movies.map((movie, index) => {
            const id = movie._id || movie.id || `movie-${index}`;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
                <Paper
                  className="movie-card"
                  onClick={() => handleMovieClick(id)}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "150%", // 2:3 aspect ratio
                      overflow: "hidden",
                      bgcolor: movie.posterUrl ? "transparent" : "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        style={{
                          position: "absolute",
                          top: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h6"
                        sx={{ p: 2, textAlign: "center" }}
                      >
                        {movie.title}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {movie.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {movie.duration} minutes
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        mb: 1,
                      }}
                    >
                      {movie.description}
                    </Typography>
                    {movie.genres && movie.genres.length > 0 && (
                      <Box sx={{ mt: "auto" }}>
                        <Typography variant="caption" color="text.secondary">
                          {movie.genres.join(" • ")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MoviesPage;
