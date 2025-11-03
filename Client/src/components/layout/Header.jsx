import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/components/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  return (
    <AppBar position="static" color="default" className="header">
      <Toolbar className="toolbar">
        <Typography variant="h6" onClick={() => navigate("/")} className="logo">
          Movie Booking
        </Typography>

        <div className="nav-links">
          <Button color="inherit" onClick={() => navigate("/")}>
            Movies
          </Button>
          {user && (
            <Button color="inherit" onClick={() => navigate("/bookings")}>
              My Bookings
            </Button>
          )}
        </div>

        <div className="auth-section">
          {user ? (
            <>
              <IconButton onClick={handleMenu} className="profile-button">
                <Avatar className="avatar">
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                className="profile-menu"
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
