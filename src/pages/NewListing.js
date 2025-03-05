import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './NewListing.css';

function NewListing() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error("Error fetching users:", error))
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    short_description: '',
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
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prevState => ({ 
      ...prevState, 
      owner: selectedOption ? selectedOption.value : '' 
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
      const response = await fetch('http://localhost:5000/listings', {
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
            name="short_description"
            value={formData.short_description}
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
          <label htmlFor="owner">Owner</label>
          <Select
            id="owner"
            name="owner"
            value={users.find(option => option.value === formData.owner) || {}}
            onChange={handleSelectChange}
            options={
              users.map(user => ({
                value: user.id,
                label: `${user.name} (${user.email})`
              }))
            }
            isClearable
            isSearchable
            placeholder="Search for an owner..."
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
