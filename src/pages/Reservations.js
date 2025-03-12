import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import './Reservations.css';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [propertyReservations, setPropertyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchReservations();
    fetchPropertyReservations();
  }, []);

  const fetchPropertyReservations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to view property reservations');
      }
          
      const response = await fetch('http://localhost:5000/reservations/my-properties', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch property reservations');
      }
      
      const data = await response.json();
      setPropertyReservations(data.reservations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        // console.log(session)
        if (!session) {
            throw new Error('You must be logged in to make a reservation');
        }
            
      const response = await fetch('http://localhost:5000/reservations/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
        // credentials: 'include' // Include cookies for authentication if needed
      });
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setReservations(data.reservations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="my-reservations-container">
      <h2 className="section-title">My Reservations</h2>
      
      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>You don't have any reservations yet.</p>
          <Link to="/" className="browse-button">Browse Properties</Link>
        </div>
      ) : (
        <div className="reservations-list">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-image">
                <img
                  src={reservation.listings?.image_url || "https://via.placeholder.com/300x200"}
                  alt="Property"
                  className="property-image"
                />
              </div>
              
              <div className="reservation-details">
                <div className="reservation-header">
                  <h3 className="property-name">{reservation.listings?.short_description || "Property"}</h3>
                  <span className="reservation-status">Confirmed</span>
                </div>
                
                <div className="reservation-location">
                  <i className="location-icon">📍</i>
                  <span>{reservation.listings?.city || "Unknown location"}, {reservation.listings?.country || ""}</span>
                </div>
                
                <div className="reservation-dates">
                  <div className="date-range">
                    <div className="check-in">
                      <span className="date-label">Check-in</span>
                      <span className="date-value">{new Date(reservation.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="date-separator">→</div>
                    <div className="check-out">
                      <span className="date-label">Check-out</span>
                      <span className="date-value">{new Date(reservation.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="reservation-meta">
                  <div className="guests">
                    <span className="meta-label">Guests</span>
                    <span className="meta-value">{reservation.number_of_guests}</span>
                  </div>
                  <div className="total-cost">
                    <span className="meta-label">Total</span>
                    <span className="meta-value">${reservation.total_cost.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="reservation-actions">
                  <Link to={`/details/${reservation.listing}`} className="view-details-button">
                    View Property
                  </Link>
                  <button className="contact-host-button">Contact Host</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Reservations on My Properties</h2>
      
      {propertyReservations.length === 0 ? (
        <div className="no-reservations">
          <p>You don't have any reservations on your properties yet.</p>
          <Link to="/new-listing" className="browse-button">Add a Property</Link>
        </div>
      ) : (
        <div className="reservations-list">
          {propertyReservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-image">
                <img
                  src={reservation.listings?.image_url || "https://via.placeholder.com/300x200"}
                  alt="Property"
                  className="property-image"
                />
              </div>
              
              <div className="reservation-details">
                <div className="reservation-header">
                  <h3 className="property-name">{reservation.listings?.short_description || "Property"}</h3>
                  <span className="reservation-status">Confirmed</span>
                </div>

                <div className="guest-info">
                  <span className="meta-label">Primary Guest:</span>
                  <span className="meta-value">{reservation.profiles?.full_name || "Unknown Guest"}</span>
                </div>
                
                <div className="reservation-location">
                  <i className="location-icon">📍</i>
                  <span>{reservation.listings?.city || "Unknown location"}, {reservation.listings?.country || ""}</span>
                </div>
                
                <div className="reservation-dates">
                  <div className="date-range">
                    <div className="check-in">
                      <span className="date-label">Check-in</span>
                      <span className="date-value">{new Date(reservation.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="date-separator">→</div>
                    <div className="check-out">
                      <span className="date-label">Check-out</span>
                      <span className="date-value">{new Date(reservation.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="reservation-meta">
                  <div className="guests">
                    <span className="meta-label">Guests</span>
                    <span className="meta-value">{reservation.number_of_guests}</span>
                  </div>
                  <div className="total-cost">
                    <span className="meta-label">Total</span>
                    <span className="meta-value">${reservation.total_cost.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="reservation-actions">
                  <Link to={`/details/${reservation.listing}`} className="view-details-button">
                    View Property
                  </Link>
                  <button className="contact-guest-button">Contact Guest</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Reservations;