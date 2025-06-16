import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import ListingCard from "../components/ListingCard";

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = require('../AuthContext').useAuth();

  useEffect(() => {
    if (user && user.id) {
      fetchListings(user.id);
    } else {
      setLoading(false);
      setListings([]);
    }
    // Refetch listings when user changes (log in/out)
    // We can depend on user?.id so fetch triggers as needed
  }, [user]);

  const fetchListings = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/listings?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data.listings || []);
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
        ) : !user ? (
          <div className="error-state">
            <p>You must be logged in to see available listings.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="error-state">
            <p>No listings available for your account.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;