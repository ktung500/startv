import React, { useState } from 'react';
import { Calendar } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import './ReservationCalendar.css';

const ReservationCalendar = ({ reservations }) => {
  const navigate = useNavigate();
  const [hoveredReservationId, setHoveredReservationId] = useState(null);

  const getReservationForDate = (date) => {
    return reservations.find(reservation => {
      const start = new Date(reservation.start_date);
      const end = new Date(reservation.end_date);
      return date >= start && date <= end;
    });
  };

  const renderDay = (date) => {
    const reservation = getReservationForDate(date);
    
    if (reservation) {
      const isHovered = hoveredReservationId === reservation.reservation_id;
      
      return (
        <div 
          onClick={() => navigate(`/reservation/${reservation.reservation_id}`)}
          onMouseEnter={() => setHoveredReservationId(reservation.reservation_id)}
          onMouseLeave={() => setHoveredReservationId(null)}
          style={{ 
            cursor: 'pointer',
            backgroundColor: isHovered ? '#ffcdd2' : '#ffebee',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s ease'
          }}
        >
          {date.getDate()}
        </div>
      );
    }

    return date.getDate();
  };

  return (
    <div className="reservation-calendar-container">
      <h3>Reservation Calendar</h3>
      <Calendar
        size="xl"
        fullWidth
        renderDay={renderDay}
       
      />
    </div>
  );
};

export default ReservationCalendar;