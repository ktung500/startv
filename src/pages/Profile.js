// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import supabase from '../supabaseClient'; 
import './Profile.css'; // Create this CSS file for styling

/**
 * Utility to get initials from name, fallback to "U"
 */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Profile = () => {
  const {user, session, profile, updateProfile, supabase, loading: authLoading} = useAuth();
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
    website: '',
    bio: ''
  });
  
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Set form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        website: profile.website || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Update profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await updateProfile(formData);
    
    if (!error) {
      setEditing(false);
    }
  };

  // Sign out functionality
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile information...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="profile-container-modern">
      <div className="profile-card-modern">

        {/* Utility to extract initials */}
        {/*
          Returns e.g. "JD" for "John Doe", falls back to "U"
        */}
        {/* getInitials now imported above for initials avatar */}

        {/* Avatar at top for both modes */}
        <div className="profile-avatar-modern">
          {(editing
              ? formData.avatar_url
              : profile?.avatar_url
            ) ? (
            <img
              src={editing ? formData.avatar_url : profile?.avatar_url}
              alt="Profile avatar"
              onError={e => {
                // fallback to initials if image broken
                e.target.style.display = "none";
                e.target.parentNode.querySelector('.profile-initials-avatar-modern').style.display = "flex";
              }}
              style={{ display: "block"}}
            />
          ) : null}
          {/* Initials fallback (default hidden if image exists) */}
          <div
            className="profile-initials-avatar-modern"
            style={{
              display: (editing ? formData.avatar_url : profile?.avatar_url) ? "none" : "flex"
            }}
          >
            {getInitials(editing ? formData.full_name : profile?.full_name)}
          </div>
        </div>
        <h2 className="profile-title-modern">
          {profile?.username ? profile.username : "Profile"}
        </h2>

        {editing ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            // Only send fields we actually use (no website)
            const minimalFormData = {
              full_name: formData.full_name,
              username: formData.username,
              avatar_url: formData.avatar_url,
              bio: formData.bio,
            };
            const { error: upError } = await updateProfile(minimalFormData);
            if (upError) {
              setError(upError.message || "Failed to update profile.");
            } else {
              setEditing(false);
            }
          }} className="profile-form-modern">
            {/* Edit picture button & hidden file input under avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <input
                type="file"
                id="profile-avatar-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  // Show immediate preview
                  const tempUrl = URL.createObjectURL(file);
                  setFormData(current => ({
                    ...current,
                    avatar_url: tempUrl
                  }));
                  // Upload to Supabase Storage (bucket: "avatars")
                  try {
                    const fileExt = file.name.split('.').pop();
                    const filePath = `profile_${user.id}_${Date.now()}.${fileExt}`;
                    const { data, error} = await supabase.storage
                      .from("avatars")
                      .upload(filePath, file, {upsert: false});
                    if (error) {
                      console.log('Error uploading file:', error);
                    } else {
                      console.log('File uploaded successfully:', data);
                    }
                    // Get public URL
                    const { data: publicUrlData } = supabase.storage
                      .from("avatars")
                      .getPublicUrl(filePath);
                    setFormData(current => ({
                      ...current,
                      avatar_url: publicUrlData.publicUrl
                    }));
                    setError(null);
                  } catch (err) {
                    setError("Unexpected error: " + (err.message || err));
                  }
                }}
              />
              <button
                type="button"
                className="profile-edit-picture-btn-modern"
                style={{
                  margin: "6px 0 20px 0",
                  background: "#e9f8f1",
                  color: "#176441",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: 500,
                  fontSize: "1rem",
                  padding: "8px 16px",
                  letterSpacing: ".01em",
                  cursor: "pointer",
                  boxShadow: "0 1px 5px #72d7b74a"
                }}
                onClick={() => {
                  document.getElementById("profile-avatar-upload").click();
                }}
              >
                Edit Picture
              </button>
            </div>
            <div className="profile-fields-modern">
              <div>
                <label className="profile-label-modern" htmlFor="full_name">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="profile-input-modern"
                />
              </div>
              <div>
                <label className="profile-label-modern">Email</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="profile-input-modern"
                />
              </div>
              {/* Avatar URL and file input REMOVED from here */}
              <div>
                <label className="profile-label-modern" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="profile-input-modern"
                />
              </div>
              <div>
                <label className="profile-label-modern" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows="3"
                  className="profile-input-modern"
                />
              </div>
            </div>
            <div className="profile-button-group-modern">
              <button type="submit" className="profile-save-btn-modern" disabled={authLoading}>
                {authLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="profile-cancel-btn-modern"
                disabled={authLoading}
              >
                Cancel
              </button>
            </div>
            {error && (
              <div className="profile-error-modern">{error}</div>
            )}
          </form>
        ) : (
          <div className="profile-info-modern">
            <div className="profile-info-row-modern">
              <span className="profile-info-label-modern">Full Name</span>
              <span>{profile?.full_name || "-"}</span>
            </div>
            <div className="profile-info-row-modern">
              <span className="profile-info-label-modern">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="profile-info-row-modern">
              <span className="profile-info-label-modern">Member Since</span>
              <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</span>
            </div>
            <div className="profile-info-row-modern">
              <span className="profile-info-label-modern">Username</span>
              <span>{profile?.username || "-"}</span>
            </div>
            <div className="profile-info-row-modern">
              <span className="profile-info-label-modern">Bio</span>
              <span>{profile?.bio || "-"}</span>
            </div>
            <div className="profile-button-group-modern">
              <button
                onClick={() => setEditing(true)}
                className="profile-edit-btn-modern"
              >
                Edit
              </button>
              <button
                onClick={handleSignOut}
                className="profile-signout-btn-modern"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Modern fallback initials avatar */
export default Profile;
