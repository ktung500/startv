import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import './MyListings.css';

function MyListings() {
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { session } = useAuth();

    useEffect(() => {
        fetchMyListings();
    }, [session]);

    const fetchMyListings = async () => {
        try {
            if (!session) {
                throw new Error('You must be logged in to view your listings');
            }

            const response = await fetch('http://localhost:5000/my-listings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data = await response.json();
            setMyListings(data.listings);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="my-listings-container">
                <div className="loading-state">Loading your listings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-listings-container">
                <div className="error-state">{error}</div>
            </div>
        );
    }

    return (
        <div className="my-listings-container">
            <h1>My Properties</h1>
            {myListings.length === 0 ? (
                <div className="no-listings">
                    <p>You haven't listed any properties yet.</p>
                    <Link to="/listing/new" className="add-listing-button">
                        Add Your First Property
                    </Link>
                </div>
            ) : (
                <div className="listings-grid">
                    {myListings.map((listing) => (
                        <div key={listing.id} className="listing-card">
                            <img
                                src={listing.image || 'https://placehold.co/300x200'}
                                alt={listing.short_description}
                                className="listing-image"
                            />
                            <div className="listing-details">
                                <h3 className="listing-title">{listing.short_description || "Property"}</h3>
                                <p className="listing-location">{listing.city}, {listing.country}</p>
                                <p className="listing-price">${listing.cost_per_night} per night</p>
                                <p className="listing-occupancy">Max Guests: {listing.max_occupancy}</p>
                                <div className="listing-actions">
                                    <Link to={`/details/${listing.id}`} className="view-details-button">
                                        View Details
                                    </Link>
                                    <Link to={`/listing/edit/${listing.id}`} className="edit-listing-button">
                                        Edit Listing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyListings;
