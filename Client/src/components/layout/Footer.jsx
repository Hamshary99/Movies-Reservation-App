import React from "react";
import { Container, Typography, Link } from "@mui/material";
import "../../styles/components/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <div className="footer-section">
            <Typography variant="h6" className="footer-title">
              Movie Booking
            </Typography>
            <Typography variant="body2" className="footer-description">
              Book your favorite movies with ease and comfort
            </Typography>
          </div>

          <div className="footer-section">
            <Typography variant="subtitle1" className="footer-subtitle">
              Quick Links
            </Typography>
            <Link href="/" className="footer-link">
              Home
            </Link>
            <Link href="/movies" className="footer-link">
              Movies
            </Link>
            <Link href="/contact" className="footer-link">
              Contact
            </Link>
          </div>

          <div className="footer-section">
            <Typography variant="subtitle1" className="footer-subtitle">
              Legal
            </Typography>
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>
            <Link href="/faq" className="footer-link">
              FAQ
            </Link>
          </div>
        </div>

        <Typography variant="body2" className="copyright">
          © {new Date().getFullYear()} Movie Booking. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
