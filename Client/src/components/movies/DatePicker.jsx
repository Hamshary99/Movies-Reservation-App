import React, { useState } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { format } from "date-fns";
import "../../styles/components/DatePicker.css";

const DatePicker = ({ onDateSelect, selectedDate }) => {
  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <Box className="date-picker-container">
      <Typography variant="h6" gutterBottom>
        Select Date
      </Typography>
      <Grid container spacing={2} className="dates-grid">
        {dates.map((date) => {
          const formattedDate = format(date, "yyyy-MM-dd");
          const isSelected = formattedDate === selectedDate;

          return (
            <Grid item key={formattedDate}>
              <div
                className={`date-item ${isSelected ? "selected" : ""}`}
                onClick={() => onDateSelect(formattedDate)}
              >
                <div className="date-weekday">{format(date, "EEE")}</div>
                <div className="date-day">{format(date, "d")}</div>
                <div className="date-month">{format(date, "MMM")}</div>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DatePicker;
