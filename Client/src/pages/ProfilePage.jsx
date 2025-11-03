import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { userProfileService } from "../services/api";

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch profile when component mounts (uses authenticated user — no ID needed)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userProfileService.getUserProfile(); // ← no user.id passed
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // ← Only run once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Build payload: only include password if provided
    const updateData = { name, email };
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;

    try {
      await userProfileService.updateUserProfile(user.id, updateData);

      // Optional: refresh global user context
      if (refreshUser) await refreshUser();

      setSuccess("Profile updated successfully!");
      setPassword(""); // clear sensitive field
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            margin="normal"
            type="email"
          />
          <TextField
            fullWidth
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
            margin="normal"
            type="tel"
          />

          {isEditing && (
            <TextField
              fullWidth
              label="New Password (optional)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            {isEditing ? (
              <>
                <Button variant="contained" type="submit" color="primary">
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setIsEditing(true)}
                color="primary"
              >
                Edit Profile
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setIsEditing(true);
                setPassword(""); // optional: focus or prep for password change
              }}
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
              sx={{ ml: "auto" }}
            >
              Logout
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              {success}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
