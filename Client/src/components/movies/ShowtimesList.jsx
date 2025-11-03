import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Paper, Button } from "@mui/material";
import { format, parse } from "date-fns";
import "../../styles/components/ShowtimesList.css";

const ShowtimesList = ({ showtimes, selectedDate }) => {
  const navigate = useNavigate();

  const handleShowtimeSelect = (showtimeId) => {
    navigate(`/showtimes/${showtimeId}`);
  };

  if (!showtimes.length) {
    return (
      <Paper className="no-showtimes">
        <Typography>
          No showtimes available for this date. Please select another date.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2} className="showtimes-grid" key="showtimes-grid">
      {showtimes.map((showtime, idx) => (
        <Grid item xs={12} sm={6} md={4} key={showtime._id || showtime.id || idx}>
          <Paper className="showtime-card">
            <Typography variant="h6" className="showtime-time">
              {(() => {
                try {
                  // Prefer backend time if provided, otherwise try startTime
                  if (showtime.time) {
                    // Parse HH:mm or HH:mm:ss into a Date for formatting
                    const parsed = parse(showtime.time, showtime.time.length > 5 ? "HH:mm:ss" : "HH:mm", new Date());
                    return format(parsed, "h:mm a");
                  }
                  if (showtime.startTime) {
                    return format(new Date(showtime.startTime), "h:mm a");
                  }
                } catch {}
                return showtime.time || "";
              })()}
            </Typography>

            <Typography variant="body1" className="showtime-hall">
              {showtime.hall?.name || showtime.hallName}
            </Typography>

            <Typography variant="body2" className="available-seats">
              {showtime.availableSeats != null ? `${showtime.availableSeats} seats available` : ""}
            </Typography>

            <Typography variant="h6" className="showtime-price">
              {showtime.price != null ? `$${showtime.price}` : ""}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleShowtimeSelect(showtime._id || showtime.id)}
              className="select-seats-button"
            >
              Select Seats
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ShowtimesList;
