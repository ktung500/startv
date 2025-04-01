import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Details.css';
import { Paper, Button } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import supabase from '../supabaseClient';

const ResDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservationAndListing = async () => {
      try {
        const reservationResponse = await fetch(`http://localhost:5000/reservations/${id}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });
        
        if (!reservationResponse.ok) {
          throw new Error('Reservation not found');
        }
        
        const reservationData = await reservationResponse.json();
        console.log(reservationData)
        setReservation(reservationData.reservation[0]);

        const listingResponse = await fetch(`http://localhost:5000/listings/${reservationData.reservation[0].listing}`);
        if (!listingResponse.ok) {
          throw new Error('Listing not found');
        }
        
        const listingData = await listingResponse.json();
        setListing(listingData.listing);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReservationAndListing();
  }, [id]);

  const handleCancelReservation = async () => {
    try {
      const response = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        navigate('/reservations');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel reservation');
      }
    } catch (err) {
      setError('Failed to cancel reservation');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  console.log(reservation)
  if (error || !reservation) {
    return (
      <div className="details-container">
        <div className="error-message">
          {error || 'Reservation not found'}
          <button onClick={() => navigate('/reservations')}>Back to Reservations</button>
        </div>
      </div>
    );
  }

  const startDate = new Date(reservation.start_date).toLocaleDateString();
  const endDate = new Date(reservation.end_date).toLocaleDateString();

  return (
    <MantineProvider>
      <div className="details-container">
        <button className="back-button" onClick={() => navigate('/reservations')}>
          ← Back to Reservations
        </button>

        <Paper shadow="sm" p="md" radius="md">
          <h2>{listing.short_description}</h2>
          <div className="reservation-info">
            <p><strong>Primary Guest:</strong> {reservation.profiles?.full_name}</p>
            <p><strong>Check-in:</strong> {startDate}</p>
            <p><strong>Check-out:</strong> {endDate}</p>
            <p><strong>Guests:</strong> {reservation.number_of_guests}</p>
            <p><strong>Total Cost:</strong> ${reservation.total_cost}</p>
            <p><strong>Status:</strong> <span style={{
              color: reservation.status === 'confirmed' ? '#388e3c' : '#d32f2f',
              textTransform: 'capitalize'
            }}>{reservation.status || 'confirmed'}</span></p>
          </div>

          {reservation.status === 'confirmed' && (
            <Button
              color="red"
              variant="outline"
              onClick={handleCancelReservation}
              style={{ marginTop: '20px' }}
            >
              Cancel Reservation
            </Button>
          )}
        </Paper>
      </div>
    </MantineProvider>
  );
};

export default ResDetails;