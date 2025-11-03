import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { format, addDays } from "date-fns";
import ShowtimesList from "../components/movies/ShowtimesList";
// Import the axios instance directly so we can request all showtimes for a movie
// without passing a date (some service helpers expect a date and will throw).
import api from "../services/api/apiConfig";
import "../styles/pages/ShowtimesPage.css";

const ShowtimesPage = () => {
  const { movieId } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showtimesMap, setShowtimesMap] = useState({}); // { 'yyyy-MM-dd': [showtimes] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNext7Days = async () => {
      try {
        setLoading(true);
        setError(null);

        const days = Array.from({ length: 7 }).map((_, i) =>
          addDays(new Date(), i)
        );

        // Fetch all showtimes for this movie using the new backend route
        // then split them locally by date for the next 7 days.
        const response = await api.get(`/user/showtime/movie/${movieId}`);
        const data = response.data || response;
        const raw = data?.showtime || data?.showtimes || data || [];
        const allShowtimes = Array.isArray(raw) ? raw : [];

        console.log("allShowtimes: ", allShowtimes);

        const map = {};
        days.forEach((d) => {
          const key = format(new Date(d), "yyyy-MM-dd");
          map[key] = allShowtimes.filter((st) => {
            try {
              // Support either ISO datetime in startTime or separate date field
              if (st.date) {
                const dateStr = String(st.date);
                const normalized = dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr; // yyyy-MM-dd
                return normalized === key;
              }
              if (st.startTime) {
                return format(new Date(st.startTime), "yyyy-MM-dd") === key;
              }
              return false;
            } catch (e) {
              return false;
            }
          });
        });
        setShowtimesMap(map);
      } catch (err) {
        console.error("Showtimes fetch error:", err);
        setError("Failed to load showtimes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchNext7Days();
  }, [movieId]);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  if (error) {
    return (
      <Container className="error-container">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container className="showtimes-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" className="section-title">
          Showtimes — Next 7 Days
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: "auto" }}>
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const isSelected = format(selectedDate, "yyyy-MM-dd") === key;
            const count = showtimesMap[key]?.length || 0;
            return (
              <Button
                key={key}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setSelectedDate(d)}
              >
                <Box>
                  <Typography variant="subtitle2">
                    {format(d, "EEE")}
                  </Typography>
                  <Typography variant="caption">
                    {format(d, "MMM d")}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {count} showtime{count !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box className="showtimes-section">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Showtimes for {format(selectedDate, "PPP")}
        </Typography>
        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
          </Box>
        ) : (
          <ShowtimesList
            showtimes={showtimesMap[format(selectedDate, "yyyy-MM-dd")] || []}
            selectedDate={selectedDate}
          />
        )}
      </Box>
    </Container>
  );
};

export default ShowtimesPage;
