import React, {useState, useEffect} from 'react';
import supabase from '../supabaseClient';

function MyListings() {
    const [myListings, setMyListings] = useState([]);
    useEffect(() => {
        fetchMyListings()
    }, []);

    const fetchMyListings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
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
            // setLoading(false);
          } catch (err) {
            // setError(err.message);
            // setLoading(false);
          }
    }
    return (
      <div>
        <span> hi </span>
        {myListings.map((listing) => (
          <div>
            <h3> {listing?.short_description || "Property"}</h3>
          </div>
        ))}
      </div>
    )
}

export default MyListings;
