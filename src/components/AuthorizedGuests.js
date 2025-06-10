import React, { useEffect, useState } from 'react';


const AuthorizedGuests = ({ listingId }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/listing_access/${listingId}`);
        const result = await res.json();
        if (res.ok && result.authorized) {
          setGuests(result.authorized);
        } else {
          setGuests([]);
        }
      } catch (e) {
        setGuests([]);
      }
      setLoading(false);
    };
    if (listingId) fetchGuests();
  }, [listingId]);

  if (loading) {
    return (
      <div className="authorized-guests-section">
        <h3>Authorized Guests</h3>
        <p>Loading guests…</p>
      </div>
    );
  }

  return (
    <div className="authorized-guests-section">
      <h3>Authorized Guests</h3>
      {guests.length === 0 ? (
        <p>No guests authorized for this listing yet.</p>
      ) : (
        <ul>
          {guests.map((guest) => (
            <li key={guest.user_id}>
              <strong>{guest.username}</strong>
              {guest.access_tier ? <> &nbsp;<span style={{color:'#246c38'}}>Tier: {guest.access_tier}</span></> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorizedGuests;