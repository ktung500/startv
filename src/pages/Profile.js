// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import supabase from '../supabaseClient'; 
import './Profile.css'; // Create this CSS file for styling

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
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {editing ? (
        // Edit mode
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={user?.email || ''} disabled />
            <p className="field-note">Email cannot be changed</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar_url">Avatar URL</label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="text"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="Avatar URL"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={formData.website}
              onChange={handleChange}
              placeholder="Website"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>
          
          <div className="button-group">
            <button type="submit" className="save-button" disabled={authLoading}>
              {authLoading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setEditing(false)}
              disabled={authLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // View mode
        <div className="profile-details">
          {profile?.avatar_url && (
            <div className="profile-avatar">
              <img src={profile.avatar_url} alt="Profile" />
            </div>
          )}
          
          <div className="profile-info">
            <div className="info-group">
              <h3>Email</h3>
              <p>{user?.email}</p>
            </div>
            
            {profile?.username && (
              <div className="info-group">
                <h3>Username</h3>
                <p>{profile.username}</p>
              </div>
            )}
            
            {profile?.full_name && (
              <div className="info-group">
                <h3>Full Name</h3>
                <p>{profile.full_name}</p>
              </div>
            )}
            
            {profile?.website && (
              <div className="info-group">
                <h3>Website</h3>
                <p>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                </p>
              </div>
            )}
            
            {profile?.bio && (
              <div className="info-group">
                <h3>Bio</h3>
                <p>{profile.bio}</p>
              </div>
            )}
            
            <div className="info-group">
              <h3>Member Since</h3>
              <p>{new Date(profile?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="button-group">
            <button 
              onClick={() => setEditing(true)} 
              className="edit-button"
            >
              Edit Profile
            </button>
            <button 
              onClick={handleSignOut} 
              className="signout-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
