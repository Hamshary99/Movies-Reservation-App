import React from "react";
import PropTypes from "prop-types";
import "../../styles/components/SeatMap.css";

const SeatMap = ({ seats, selectedSeats, onSeatSelect, maxSeats = 6 }) => {
  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.includes(seat._id)) {
      onSeatSelect(selectedSeats.filter((id) => id !== seat._id));
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, seat._id]);
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.isBooked) return "booked";
    if (selectedSeats.includes(seat._id)) return "selected";
    return "available";
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.row;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-map">
      <div className="screen"></div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color legend-available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-booked"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="seats-container">
        {Object.keys(seatsByRow)
          .sort((a, b) => a.localeCompare(b))
          .map((row) => {
            const rowSeats = (seatsByRow[row] || [])
              .slice()
              .sort((a, b) => (a.number || 0) - (b.number || 0));
            return (
              <div key={row} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seats">
                  {rowSeats.map((seat) => (
                    <button
                      key={seat._id}
                      className={`seat ${getSeatStatus(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked}
                      title={`${row}${seat.number}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {selectedSeats.length >= maxSeats && (
        <div className="max-seats-warning">
          Maximum {maxSeats} seats can be selected at once
        </div>
      )}
    </div>
  );
};

SeatMap.propTypes = {
  seats: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      row: PropTypes.string.isRequired,
      number: PropTypes.number.isRequired,
      isBooked: PropTypes.bool.isRequired,
    })
  ).isRequired,
  selectedSeats: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSeatSelect: PropTypes.func.isRequired,
  maxSeats: PropTypes.number,
};

export default SeatMap;
