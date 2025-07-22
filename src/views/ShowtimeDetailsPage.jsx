import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";

function ShowtimeDetailsPage() {
  const { id } = useParams();
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchShowtime = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/user/showtime/${id}`);
        setShowtime(res.data);
        setSelectedDate(res.data.date ? res.data.date.slice(0, 10) : "");
      } catch (err) {
        setError("Failed to fetch showtime details.");
      } finally {
        setLoading(false);
      }
    };
    fetchShowtime();
  }, [id]);

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
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Showtime Details
        </Typography>
        <Typography variant="subtitle1">
          Movie: {showtime.movie?.title || "N/A"}
        </Typography>
        <Typography>Hall: {showtime.hall?.name || "N/A"}</Typography>
        <Typography>
          Date: {new Date(showtime.date).toLocaleDateString()}
        </Typography>
        <Typography>Time: {showtime.time}</Typography>
        <Typography>Price: ${showtime.price}</Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Pick a date:</Typography>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ mt: 1, width: 200 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary">
            Book Now
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ShowtimeDetailsPage;
