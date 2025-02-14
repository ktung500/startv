import React, { useState } from 'react';
import './AddListing.css';

function AddListing({onClose, onSubmit}) {
    const [listing, setListing] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        owner: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listing),
            });
            
            if (response.ok) {
                setListing({
                    title: '',
                    description: '',
                    price: '',
                    location: '',
                    owner: ''
                });
                onSubmit(listing);
                onClose();
            }
        } catch (error) {
            console.error('Error adding listing:', error);
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setListing(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="add-listing-container">
            <div className="modal-content">
                <h2>Add New Listing</h2>
                <form onSubmit={handleSubmit}>
                    <div className="listing-form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={listing.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="listing-form-group">
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={listing.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="listing-form-group">
                        <label htmlFor="owner">Owner:</label>
                        <input
                            type="text"
                            id="owner"
                            name="owner"
                            value={listing.owner}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="listing-form-group">
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={listing.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="listing-form-group">
                        <label htmlFor="price">Price:</label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={listing.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit">Add Listing</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddListing;
