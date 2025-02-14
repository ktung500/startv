import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewListing.css';

function NewListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: '',
    address: '',
    city: '',
    country: '',
    cost_per_night: '',
    number_of_bedrooms: '',
    number_of_bathrooms: '',
    max_occupancy: '',
    additional_details: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numeric fields
    const numericFormData = {
      ...formData,
      cost_per_night: parseFloat(formData.cost_per_night),
      number_of_bedrooms: parseInt(formData.number_of_bedrooms),
      number_of_bathrooms: parseInt(formData.number_of_bathrooms),
      max_occupancy: parseInt(formData.max_occupancy),
      owner: parseInt(formData.owner)
    };

    try {
      const response = await fetch('http://localhost:5000/api/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericFormData),
      });

      if (response.ok) {
        alert('Listing created successfully!');
        navigate('/'); // Redirect to home page
      } else {
        const error = await response.json();
        alert('Error creating listing: ' + error.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="new-listing-container">
      <h2>Create New Listing</h2>
      <form onSubmit={handleSubmit} className="new-listing-form">
        <div className="form-group">
          <label>Property Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Owner ID:</label>
          <input
            type="number"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Country:</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Cost per Night:</label>
          <input
            type="number"
            name="cost_per_night"
            value={formData.cost_per_night}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Number of Bedrooms:</label>
          <input
            type="number"
            name="number_of_bedrooms"
            value={formData.number_of_bedrooms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Number of Bathrooms:</label>
          <input
            type="number"
            name="number_of_bathrooms"
            value={formData.number_of_bathrooms}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Max Occupancy:</label>
          <input
            type="number"
            name="max_occupancy"
            value={formData.max_occupancy}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Additional Details:</label>
          <textarea
            name="additional_details"
            value={formData.additional_details}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-button">Create Listing</button>
      </form>
    </div>
  );
}

export default NewListing;
