import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import './AuthorizedGuests.css';

// Modal separated to avoid re-render bugs
function InviteModal({
  inviteEmail,
  setInviteEmail,
  inviteTier,
  setInviteTier,
  inviteError,
  inviteLoading,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-40">
      <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-md min-w-[320px]">
        <h4 className="text-lg font-semibold mb-4">Invite Guest</h4>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-sm">
            Guest Email
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="mt-1 p-2 border rounded w-full"
              autoFocus
              required
            />
          </label>
          <label className="text-sm">
            Access Tier
            <input
              type="text"
              value={inviteTier}
              onChange={e => setInviteTier(e.target.value)}
              className="mt-1 p-2 border rounded w-full"
              required
              placeholder="e.g. standard, premium"
            />
          </label>
          {inviteError && <div className="text-red-600 text-sm">{inviteError}</div>}
          <div className="flex gap-2 mt-2 justify-end">
            <button
              type="button"
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={onClose}
              disabled={inviteLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AuthorizedGuests = ({ listingId }) => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Guest Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTier, setInviteTier] = useState('');
  const [inviteError, setInviteError] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const { session } = useAuth();

  // Fetch current authorized guests
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

  useEffect(() => {
    if (listingId) fetchGuests();
    // eslint-disable-next-line
  }, [listingId]);

  // Invite Guest API call
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);

    // Basic validation
    if (!inviteEmail || !inviteTier) {
      setInviteError('Both fields are required.');
      return;
    }
    setInviteLoading(true);

    try {
      const res = await fetch('http://localhost:5000/listing_access/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session && session.access_token
            ? { Authorization: 'Bearer ' + session.access_token }
            : {}),
        },
        body: JSON.stringify({
          email: inviteEmail,
          tier: inviteTier,
          listing_id: listingId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setInviteEmail('');
        setInviteTier('');
        fetchGuests(); // refresh guest list
      } else {
        setInviteError(data.error || 'Something went wrong.');
      }
    } catch (e) {
      setInviteError('Failed to send invite. Try again.');
    }
    setInviteLoading(false);
  };

  if (loading) {
    return (
      <div className="authorized-guests-section">
        <h3>Authorized Guests</h3>
        <p>Loading guests…</p>
      </div>
    );
  }

  return (
    <div className="authorized-guests-section relative">
      <h3>Authorized Guests</h3>
      <button
        className="mb-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModalOpen(true)}
      >
        Invite Guest
      </button>
      {modalOpen && (
        <InviteModal
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteTier={inviteTier}
          setInviteTier={setInviteTier}
          inviteError={inviteError}
          inviteLoading={inviteLoading}
          onClose={() => {
            setModalOpen(false);
            setInviteError(null);
          }}
          onSubmit={handleInvite}
        />
      )}
      {guests.length === 0 ? (
        <p>No guests authorized for this listing yet.</p>
      ) : (
        <div className="authorized-guests-table-container">
          <table className="authorized-guests-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Access Tier</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.user_id}>
                  <td>{guest.full_name || guest.email || "Guest"}</td>
                  <td>{guest.email}</td>
                  <td>{guest.access_tier || guest.tier || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuthorizedGuests;