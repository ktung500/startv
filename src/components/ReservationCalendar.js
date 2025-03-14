import React from 'react';
import { Calendar } from '@mantine/dates';
import { Paper, Text } from '@mantine/core';
import './ReservationCalendar.css';

const ReservationCalendar = ({ reservations }) => {
  // Function to check if a date has a reservation
  const getReservationForDate = (date) => {
    return reservations.find(reservation => {
      const start = new Date(reservation.start_date);
      const end = new Date(reservation.end_date);
      return date >= start && date <= end;
    });
  };

  // Custom day render function
  const renderDay = (date) => {
    const reservation = getReservationForDate(date);
    const dayKey = date.toISOString();

    if (reservation) {
      return (
        <div key={dayKey} className="calendar-day reserved">
          <div className="day-content">
            <span>{date.getDate()}</span>
            <div className="reservation-info">
              <Text size="xs" weight={500}>Reserved</Text>
              <Text size="xs">{reservation.profiles?.full_name || 'Guest'}</Text>
              <Text size="xs">Guests: {reservation.number_of_guests}</Text>
              <Text size="xs">${reservation.total_cost}</Text>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={dayKey} className="calendar-day">
        <span>{date.getDate()}</span>
      </div>
    );
  };

  return (
    <Paper shadow="sm" radius="md" p="md" className="reservation-calendar-container">
      <h3>Reservation Calendar</h3>
      <Calendar
        size="xl"
        fullWidth
        renderDay={renderDay}
        styles={(theme) => ({
          calendar: {
            width: '100%'
          },
          cell: {
            border: `1px solid ${theme.colors.gray[2]}`
          }
        })}
      />
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color reserved"></div>
          <Text size="sm">Reserved</Text>
        </div>
        <div className="legend-item">
          <div className="legend-color available"></div>
          <Text size="sm">Available</Text>
        </div>
      </div>
    </Paper>
  );
};

export default ReservationCalendar;