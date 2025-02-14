import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Details.css';
const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        console.log("id: " + id)
        const response = await fetch(`http://localhost:5000/api/listing/${id}`);
        if (!response.ok) {
          throw new Error('Listing not found');
        }
        const data = await response.json();
        setListing(data);
        console.log(JSON.stringify(data))
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

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

  return (
    <div className="details-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Listings
      </button>
      
      <div className="listing-details-card">
        <img 
          src={listing.image || 'https://placehold.co/300x200'} 
          alt={listing.name} 
          className="listing-detail-image"
        />
        
        <div className="listing-info">
          <h1>{listing.name}</h1>
          <div className="price-location">
            <h2 className="price">{listing.price}</h2>
            <p className="location">{listing.address}</p>
          </div>

          <div className="listing-stats">
            <div className="stat">
              <span className="label">Owner</span>
              <span className="value">{listing.owner}</span>
            </div>
            {/* Add more stats as needed based on your database schema */}
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{listing.description || 'No description available.'}</p>
          </div>

          {/* Only show amenities if they exist in your data */}
          {listing.amenities && (
            <div className="amenities">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {listing.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Details;
