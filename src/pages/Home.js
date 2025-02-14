import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newListing, setNewListing] = useState({
    name: '',
    address: '',
    owner: '',
    price: '',
    image: 'https://placehold.co/300x200'
  });
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listing');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newListing),
      });

      if (!response.ok) {
        throw new Error('Failed to add listing');
      }

      // Clear the form
      setNewListing({
        name: '',
        address: '',
        owner: '',
        price: '',
        image: 'https://placehold.co/300x200'
      });

      // Refresh the listings list
      fetchListings();
    } catch (err) {
      console.error('Error adding listing:', err);
    }
  };

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="home-container">
      <h1>Featured Listings</h1>
      
      {/* Add listing button */}
      <div>
        <Link to="/listing/new" className="add-listing-button">Add New Listing</Link>
      </div>

      <div className="listing-scroll-area">
        {listings.map((listing, index) => (
          <div key={index} className="listing-card">
            <img
              src={listing.image}
              alt={listing.name}
              className="listing-image"
            />
            <div className="listing-details">
              <div className="listing-title">{listing.name}</div>
              <div className="listing-price">{listing.price}</div>
              <div className="listing-location">{listing.address}</div>
              <div className="listing-owner">Owner: {listing.owner}</div>
              <Link to={`/details/${listing.id}`} className="view-details">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;