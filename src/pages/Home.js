import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data.listings);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading listings...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : (
            <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="listing-card">
                  <img
                  src={listing.image || 'https://placehold.co/300x200'}
                  alt={listing.short_description}
                  className="listing-image"
                  />
                  <div className="listing-details">
                  <h3 className="listing-title">{listing.short_description}</h3>
                  <p className="listing-location">{listing.city}, {listing.country}</p>
                  <p className="listing-price">${listing.cost_per_night} per night</p>
                  <p className="listing-occupancy">Max Guests: {listing.max_occupancy}</p>
                    <Link to={`/details/${listing.id}`} className="view-details-button">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
        )}
      </main>
    </div>
  );
}

export default Home;