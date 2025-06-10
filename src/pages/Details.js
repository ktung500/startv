import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Details.css';
import { DatePicker } from '@mantine/dates';
import { Paper, Group, Text, Button, NumberInput } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import supabase from '../supabaseClient';
import { useAuth } from '../AuthContext';
import ReservationCalendar from '../components/ReservationCalendar';

import AuthorizedGuests from '../components/AuthorizedGuests';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [numGuests, setNumGuests] = useState(1);
  const [reservationStatus, setReservationStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isDateBooked = (date) => {
    return reservations.some(reservation => {
      const startDate = new Date(reservation.start_date);
      const endDate = new Date(reservation.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:5000/listings/${id}`);
        if (!response.ok) {
          throw new Error('Listing not found');
        }
        const data = await response.json();
        setListing(data.listing);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchReservations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/reservations/property/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reservations');
        }
        const data = await response.json();
        setReservations(data.reservations || []);
      } catch (err) {
        console.error("Error fetching reservations:", err);
      }
    };

    fetchListing();
    fetchReservations();
  }, [id]);

  // Fetch the owner's profile from Supabase if there's a listing and owner_id
  useEffect(() => {
    const fetchOwnerProfile = async () => {
      if (listing && listing.owner) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', listing.owner)
          .single();
        if (!error && data) {
          setOwnerProfile(data);
        } else {
          setOwnerProfile({ username: "Unknown" });
        }
      }
    };
    fetchOwnerProfile();
  }, [listing]);

  const calculateTotalCost = () => {
    if (!dateRange[0] || !dateRange[1] || !listing) {
      return 0;
    }
    
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays * listing.cost_per_night;
  };

  const handleReservation = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      setReservationStatus({ error: "Please select both check-in and check-out dates" });
      return;
    }

    setIsSubmitting(true);
    setReservationStatus(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to make a reservation');
      }
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const startDate = formatDate(dateRange[0]);
      const endDate = formatDate(dateRange[1]);
      const totalCost = calculateTotalCost();
      
      const reservationData = {
        listing: id,
        start_date: startDate,
        end_date: endDate,
        total_cost: totalCost,
        number_of_guests: numGuests,
      };
      
      const response = await fetch('http://localhost:5000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReservationStatus({ success: "Reservation created successfully!" });
      } else {
        setReservationStatus({ error: data.error || "Failed to create reservation" });
      }
    } catch (err) {
      console.error("Error creating reservation:", err);
      setReservationStatus({ error: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error || !listing) {
    return (
      <div className="details-container">
        <div className="error-message">
          {error || 'Listing not found'}
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const propertyTypeAndLocation = `Entire ${listing.property_type || 'property'} in ${listing.city || ''}, ${listing.country || ''}`;
  const capacityDetails = `${listing.max_occupancy || 0} guests · ${listing.number_of_bedrooms || 0} bedroom${listing.number_of_bedrooms !== 1 ? 's' : ''} · ${listing.number_of_bathrooms || 0} bath${listing.number_of_bathrooms !== 1 ? 's' : ''}`;
  const totalCost = calculateTotalCost();

  return (
    <MantineProvider>
      <div className="details-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Listings
        </button>

        <img 
          src={listing.image || 'https://placehold.co/600x400'} 
          alt={listing.short_description} 
          className="listing-detail-image"
        />
        
        <div className="listing-info">
          <h1>{listing.short_description}</h1>
          <div style={{marginBottom: "8px", color: "#246c38", fontWeight: 500, fontSize: "1.05rem"}}>
            Hosted by{' '}
            {ownerProfile && ownerProfile.username
              ? ownerProfile.username
              : "Unknown"}
          </div>
          <div className="property-summary">
            <h2>{propertyTypeAndLocation}</h2>
            <p className="capacity-details">{capacityDetails}</p>
          </div>

          <div className="price-info">
            <h3>${listing.cost_per_night} per night</h3>
          </div>
          <div className="description">
            <h3>Description</h3>
            <p>{listing.description || 'No description available.'}</p>
          </div>

          {listing.additional_details && (
            <div className="additional-details">
              <h3>Additional Details</h3>
              <p>{listing.additional_details}</p>
            </div>
          )}
        </div>

        {user && listing && user.id === listing.owner && (
          <AuthorizedGuests listingId={listing.id} />
        )}

        {/* Always show calendar; date picker toggled for owners */}
        <ReservationCalendar reservations={reservations} />

        {user && listing && user.id === listing.owner ? (
          <>
            <Button
              onClick={() => setShowDatePicker((show) => !show)}
              mt="sm"
              mb="md"
              style={{ margin: "24px 0 16px 0" }}
            >
              {showDatePicker ? "Hide Date Picker Section" : "Show Date Picker Section"}
            </Button>
            {showDatePicker && (
              <div className="date-picker-section">
                <h3>Select your stay dates</h3>
                <Paper shadow="sm" p="md" radius="md">
                  <DatePicker
                    type="range"
                    label="Select your dates"
                    placeholder="Pick dates"
                    value={dateRange}
                    onChange={setDateRange}
                    numberOfColumns={2}
                    minDate={new Date()}
                    allowSingleDateInRange={false}
                    excludeDate={(date) => isDateBooked(date)}
                    weekendDays={[]}
                    styles={(theme) => ({
                      day: {
                        '&[data-selected]': {
                          backgroundColor: theme.colors.blue[6],
                          color: theme.white,
                        },
                        '&[data-in-range]': {
                          backgroundColor: theme.colors.blue[0],
                          '&:hover': {
                            backgroundColor: theme.colors.blue[1],
                          },
                        },
                        '&[data-disabled]': {
                          textDecoration: 'line-through',
                          color: theme.colors.gray[5],
                        },
                      },
                      month: {
                        padding: '10px',
                      },
                    })}
                  />

                  <NumberInput
                    mt="md"
                    label="Number of guests"
                    value={numGuests}
                    onChange={setNumGuests}
                    min={1}
                    max={listing.max_occupancy || 1}
                    required
                  />

                  {totalCost > 0 && (
                    <div className="cost-summary" style={{ marginTop: "15px" }}>
                      <Text weight={500}>Price details:</Text>
                      <Text>
                        ${listing.cost_per_night} x {Math.ceil(Math.abs(dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24))} nights = ${totalCost}
                      </Text>
                    </div>
                  )}

                  {reservationStatus && (
                    <div className={`status-message ${reservationStatus.error ? 'error' : 'success'}`} style={{
                      marginTop: "15px",
                      padding: "10px",
                      backgroundColor: reservationStatus.error ? "#ffeded" : "#edfff5",
                      color: reservationStatus.error ? "#d32f2f" : "#388e3c",
                      borderRadius: "4px"
                    }}>
                      {reservationStatus.error || reservationStatus.success}
                    </div>
                  )}

                  <Group mt="lg" position="apart">
                    <Text size="sm" color="dimmed">
                      {dateRange[0] && dateRange[1]
                        ? `Selected: ${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                        : 'No dates selected'}
                    </Text>
                    <Button
                      loading={isSubmitting}
                      disabled={!dateRange[0] || !dateRange[1] || isSubmitting}
                      onClick={handleReservation}
                    >
                      {isSubmitting ? 'Creating Reservation...' : 'Reserve'}
                    </Button>
                  </Group>
                </Paper>
              </div>
            )}
          </>
        ) : (
          <div className="date-picker-section">
            <h3>Select your stay dates</h3>
            <Paper shadow="sm" p="md" radius="md">
              <DatePicker
                type="range"
                label="Select your dates"
                placeholder="Pick dates"
                value={dateRange}
                onChange={setDateRange}
                numberOfColumns={2}
                minDate={new Date()}
                allowSingleDateInRange={false}
                excludeDate={(date) => isDateBooked(date)}
                weekendDays={[]}
                styles={(theme) => ({
                  day: {
                    '&[data-selected]': {
                      backgroundColor: theme.colors.blue[6],
                      color: theme.white,
                    },
                    '&[data-in-range]': {
                      backgroundColor: theme.colors.blue[0],
                      '&:hover': {
                        backgroundColor: theme.colors.blue[1],
                      },
                    },
                    '&[data-disabled]': {
                      textDecoration: 'line-through',
                      color: theme.colors.gray[5],
                    },
                  },
                  month: {
                    padding: '10px',
                  },
                })}
              />

              <NumberInput
                mt="md"
                label="Number of guests"
                value={numGuests}
                onChange={setNumGuests}
                min={1}
                max={listing.max_occupancy || 1}
                required
              />

              {totalCost > 0 && (
                <div className="cost-summary" style={{ marginTop: "15px" }}>
                  <Text weight={500}>Price details:</Text>
                  <Text>
                    ${listing.cost_per_night} x {Math.ceil(Math.abs(dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24))} nights = ${totalCost}
                  </Text>
                </div>
              )}

              {reservationStatus && (
                <div className={`status-message ${reservationStatus.error ? 'error' : 'success'}`} style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: reservationStatus.error ? "#ffeded" : "#edfff5",
                  color: reservationStatus.error ? "#d32f2f" : "#388e3c",
                  borderRadius: "4px"
                }}>
                  {reservationStatus.error || reservationStatus.success}
                </div>
              )}

              <Group mt="lg" position="apart">
                <Text size="sm" color="dimmed">
                  {dateRange[0] && dateRange[1]
                    ? `Selected: ${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                    : 'No dates selected'}
                </Text>
                <Button
                  loading={isSubmitting}
                  disabled={!dateRange[0] || !dateRange[1] || isSubmitting}
                  onClick={handleReservation}
                >
                  {isSubmitting ? 'Creating Reservation...' : 'Reserve'}
                </Button>
              </Group>
            </Paper>
          </div>
        )}
      </div>
    </MantineProvider>
  );
};

export default Details;