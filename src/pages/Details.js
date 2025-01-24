import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Details.css';

const Details = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { property } = location.state || {};

  if (!property) {
    return (
      <div className="details-container">
        <div className="error-message">
          Property not found
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
      
      <div className="property-details-card">
        <img 
          src={property.image} 
          alt={property.title} 
          className="property-detail-image"
        />
        
        <div className="property-info">
          <h1>{property.title}</h1>
          <div className="price-location">
            <h2 className="price">{property.price}</h2>
            <p className="location">{property.location}</p>
          </div>

          <div className="property-stats">
            <div className="stat">
              <span className="label">Bedrooms</span>
              <span className="value">{property.bedrooms}</span>
            </div>
            <div className="stat">
              <span className="label">Bathrooms</span>
              <span className="value">{property.bathrooms}</span>
            </div>
            <div className="stat">
              <span className="label">Area</span>
              <span className="value">{property.area}</span>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>

          <div className="amenities">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {property.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
