import React from 'react';
import './Details.css';

const Details = () => (
  <div className="details-container">
    <div className="details-banner">
      <h1>Details Page</h1>
    </div>
    <div className="details-content">
      <div className="details-image">
        <img 
          src="https://via.placeholder.com/400x300" 
          alt="Example" 
        />
      </div>
      <div className="details-description">
        <h2>Item Title</h2>
        <p>
          This is the description text for the item. It provides detailed 
          information about the content shown in the image.
        </p>
        <p>
          You can customize this description to include any additional 
          details or context you’d like to provide.
        </p>
      </div>
    </div>
  </div>
);

export default Details;
