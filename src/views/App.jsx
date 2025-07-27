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
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  Dialog,
  IconButton,
} from "@mui/material";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import LoginSignupPage from "./LoginSignupPage";
import ProfilePage from "./ProfilePage";
function getUserInfo() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user;
  } catch {
    return null;
  }
}
import CloseIcon from "@mui/icons-material/Close";
import ShowtimesPage from "./ShowtimesPage";
import BookingDetailsPage from "./BookingDetailsPage";
import ShowtimeDetailsPage from "./ShowtimeDetailsPage";
import MoviesPage from "./MoviesPage";

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

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        Welcome to the Movies Reservation App
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pick a Movie
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
            <Paper
              sx={{ p: 2, textAlign: "center", cursor: "pointer" }}
              onClick={() => navigate(`/movie/${movie._id}`)}
            >
              <Typography variant="h6">{movie.title}</Typography>
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{
                    width: 80,
                    height: "auto",
                    marginTop: 8,
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
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function MovieDetailsPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const navigate = useNavigate();

  // Get next 7 days
  const next7Days = getNext7Days();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`/user/movies/${movieId}`);
        setMovie(res.data.movie || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load movie.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  // Fetch showtimes when a date is selected
  useEffect(() => {
    if (!selectedDate || !movieId) return;

    const fetchShowtimesForDate = async () => {
      setLoadingShowtimes(true);
      try {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split("T")[0];

        // Use the new optimized endpoint
        const res = await axios.get(
          `/user/movies/${movieId}/showtimes/${formattedDate}`
        );
        setShowtimes(res.data.showtimes || []);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimesForDate();
  }, [selectedDate, movieId]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!movie) return <Typography>Movie not found.</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Button sx={{ mb: 2 }} onClick={() => navigate("/home")}>
        Back to Movies
      </Button>
      <Typography variant="h4" gutterBottom>
        {movie.title}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{
                width: "100%",
                maxWidth: 250,
                height: "auto",
                marginBottom: 8,
                borderRadius: 4,
              }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Genres: {movie.genres?.join(", ")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Director: {movie.director}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Release Date:{" "}
            {movie.releaseDate
              ? new Date(movie.releaseDate).toLocaleDateString()
              : "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Description: {movie.description || "N/A"}
          </Typography>
          {movie.ratings && movie.ratings.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" fontWeight={500}>
                Ratings:
              </Typography>
              {movie.ratings.map((r, idx) => (
                <Typography key={idx} variant="body1" sx={{ ml: 1 }}>
                  {r.site}: {r.score}
                </Typography>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Date Selection Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Select a Date
        </Typography>
        <Grid container spacing={2}>
          {next7Days.map((day, index) => {
            const isSelected =
              selectedDate &&
              selectedDate.toDateString() === day.toDateString();
            return (
              <Grid item key={index}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: isSelected ? "primary.main" : "background.paper",
                    color: isSelected ? "white" : "text.primary",
                    minWidth: 100,
                    "&:hover": {
                      bgcolor: isSelected ? "primary.dark" : "action.hover",
                    },
                  }}
                  onClick={() => setSelectedDate(day)}
                >
                  <Typography variant="body1">
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </Typography>
                  <Typography variant="h6">{day.getDate()}</Typography>
                  <Typography variant="body2">
                    {day.toLocaleDateString(undefined, { month: "short" })}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Showtimes Section */}
      {selectedDate && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Showtimes for {selectedDate.toLocaleDateString()}
          </Typography>
          {loadingShowtimes ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : showtimes.length === 0 ? (
            <Alert severity="info">
              No showtimes available for this date. Please select another date.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {showtimes.map((showtime) => (
                <Grid item xs={12} sm={6} md={4} key={showtime._id}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Typography variant="h6">Time: {showtime.time}</Typography>
                    <Typography>
                      Hall: {showtime.hall?.name || "N/A"}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      Price: ${showtime.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate(`/showtimes/${showtime._id}`)}
                    >
                      Select Seats
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}

function MoviePage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`/user/movies/${movieId}`);
        setMovie(res.data.movie || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load movie.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!movie) return <Typography>Movie not found.</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Button sx={{ mb: 2 }} onClick={() => navigate("/home")}>
        Back to Movies
      </Button>
      <Typography variant="h4" gutterBottom>
        {movie.title}
      </Typography>
      {movie.posterUrl && (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            width: 180,
            height: "auto",
            marginBottom: 8,
            borderRadius: 4,
          }}
        />
      )}
      <Typography variant="body1" sx={{ mb: 1 }}>
        Genres: {movie.genres?.join(", ")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Director: {movie.director}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Release Date:{" "}
        {movie.releaseDate
          ? new Date(movie.releaseDate).toLocaleDateString()
          : "N/A"}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Description: {movie.description || "N/A"}
      </Typography>
      {movie.ratings && movie.ratings.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" fontWeight={500}>
            Ratings:
          </Typography>
          {movie.ratings.map((r, idx) => (
            <Typography key={idx} variant="body1" sx={{ ml: 1 }}>
              {r.site}: {r.score}
            </Typography>
          ))}
        </Box>
      )}
      {/* You can add a Book Ticket button here if needed */}
    </Box>
  );
}

function MovieDatePage() {
  const { movieId, date } = useParams();
  const [showtimes, setShowtimes] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await axios.get("/user/showtimes");
        const allShowtimes = res.data.showtime || [];
        const filtered = allShowtimes.filter(
          (s) => s.movie?._id === movieId && s.date.slice(0, 10) === date
        );
        setShowtimes(filtered);
        setMovie(filtered[0]?.movie || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load showtimes.");
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, [movieId, date]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!movie)
    return <Typography>No showtimes for this movie on this date.</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Button sx={{ mb: 2 }} onClick={() => navigate(`/movie/${movieId}`)}>
        Back to Dates
      </Button>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Showtimes for {movie.title} on {new Date(date).toLocaleDateString()}
      </Typography>
      {showtimes.length === 0 ? (
        <Typography>No showtimes available for this day.</Typography>
      ) : (
        <Grid container spacing={3}>
          {showtimes.map((show) => (
            <Grid item xs={12} md={6} lg={4} key={show._id}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Time: {show.time}</Typography>
                <Typography>Hall: {show.hall?.name || "N/A"}</Typography>
                <Typography>Price: ${show.price}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/showtimes/${show._id}`)}
                >
                  Pick Seats
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/user/booking", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // Only show bookings that are not used (isUsed !== true)
        const allBookings = res.data.booking || res.data.bookings || [];
        setBookings(allBookings.filter((b) => !b.isUsed));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Fetch movie details for bookings with movie as ID
  // (REMOVED: no longer fetch all showtimes for movie details)

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>
      {bookings.length === 0 ? (
        <Typography>No active bookings found.</Typography>
      ) : (
        bookings.map((booking) => (
          <Paper key={booking._id} sx={{ p: 3, mb: 2 }}>
            <Typography>
              <b>Movie:</b> {booking.showtime?.movie?.title || "-"}
            </Typography>
            <Typography>
              <b>Hall:</b> {booking.showtime?.hall?.name || "-"}
            </Typography>
            <Typography>
              <b>Date:</b>{" "}
              {booking.showtime?.date
                ? new Date(booking.showtime.date).toLocaleDateString()
                : "-"}
            </Typography>
            <Typography>
              <b>Time:</b> {booking.showtime?.time || "-"}
            </Typography>
            <Typography>
              <b>Seats:</b>{" "}
              {Array.isArray(booking.seats) && booking.seats.length > 0
                ? booking.seats
                    .map((seat) => seat.label || seat._id || seat)
                    .join(", ")
                : "-"}
            </Typography>
            <Typography>
              <b>Price:</b> ${booking.showtime?.price || "-"}
            </Typography>
            <Button
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={() => navigate(`/booking/${booking._id}`)}
            >
              View Details
            </Button>
          </Paper>
        ))
      )}
    </Box>
  );
}

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState(0); // 0 = login, 1 = signup
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(getUserInfo());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  useEffect(() => {
    if (location.pathname === "/home" || location.pathname === "/") {
      setTabValue(0);
    } else if (location.pathname.startsWith("/my-bookings")) {
      setTabValue(1);
    } else if (location.pathname.startsWith("/profile")) {
      setTabValue(4);
    } else {
      setTabValue(false);
    }
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      navigate("/home");
    } else if (newValue === 1) {
      navigate("/my-bookings");
    } else if (newValue === 2) {
      setLoginTab(0);
      setLoginOpen(true);
    } else if (newValue === 3) {
      setLoginTab(1);
      setLoginOpen(true);
    } else if (newValue === 4) {
      navigate("/profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post("/user/login", { email, password });
      const token = res.data.token;
      const user = res.data.user;
      if (token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        setLoginOpen(false);
        window.location.reload();
      } else {
        alert("Login failed: No token returned");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <AppBar position="static" color="default" sx={{ mb: 4 }}>
        <Toolbar>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Home" />
            <Tab label="My Bookings" disabled={!isAuthenticated()} />
            <Tab label="Login" disabled={isAuthenticated()} />
            <Tab label="Sign Up" disabled={isAuthenticated()} />
            {isAuthenticated() && (
              <Tab label={user?.name ? user.name : "Profile"} />
            )}
          </Tabs>
          {isAuthenticated() && (
            <Button color="error" sx={{ ml: 2 }} onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
        <Route path="/movie/:movieId/date/:date" element={<MovieDatePage />} />
        <Route
          path="/showtimes/:showtimeId"
          element={<ShowtimeDetailsPage />}
        />
        <Route path="/booking/:id" element={<BookingDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
      <Dialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => setLoginOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LoginSignupPage
          mode={loginTab === 0 ? "login" : "signup"}
          onLogin={handleLogin}
        />
      </Dialog>
    </>
  );
}

export default App;
