import React from "react";
import { Typography, Box, Paper } from "@mui/material";
import { format } from "date-fns";
import "../../styles/components/MovieInfo.css";

const MovieInfo = ({ movie }) => {
  return (
    <Paper className="movie-info-container">
      {movie.posterUrl && (
        <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
      )}

      <Box className="movie-details">
        <Typography variant="h4" className="movie-title">
          {movie.title}
        </Typography>

        {movie.releaseDate && (
          <Typography variant="body1" className="movie-release-date">
            Release Date: {format(new Date(movie.releaseDate), "MMMM d, yyyy")}
          </Typography>
        )}

        {movie.duration && (
          <Typography variant="body1" className="movie-duration">
            Duration: {movie.duration} minutes
          </Typography>
        )}

        {movie.genres && movie.genres.length > 0 && (
          <Typography variant="body1" className="movie-genres">
            Genres: {movie.genres.join(", ")}
          </Typography>
        )}

        {movie.director && (
          <Typography variant="body1" className="movie-director">
            Director: {movie.director}
          </Typography>
        )}

        {movie.description && (
          <Typography variant="body1" className="movie-description">
            {movie.description}
          </Typography>
        )}

        {movie.ratings && movie.ratings.length > 0 && (
          <Box className="movie-ratings">
            <Typography variant="h6">Ratings</Typography>
            {movie.ratings.map((rating, index) => (
              <Typography key={index} variant="body2" className="rating-item">
                {rating.site}: {rating.score}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default MovieInfo;
