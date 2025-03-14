import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../AuthContext';

function Header() {
    const { user, profile, loading, signOut } = useAuth();
    const navigate = useNavigate();
  
    const handleSignOut = async () => {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error("Error signing out:", error.message);
      }
    };
  
    return (
      <header className="header">
        <nav className="navbar">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              StarTV
            </Link>
          </div>
          
          <div className="nav-center">
          </div>
  
          <div className="nav-right">
            <Link to="/reservations" className="nav-button">
              Reservations
            </Link>

            <Link to="/listing/new" className="nav-button">
              List your property
            </Link>

            <Link to="/myListings" className="nav-button">
              Manage Listings
            </Link>
            
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              // Show user info when logged in
              <div className="user-menu">
                <Link to="/profile" className="nav-button">
                  <span className="username">
                    {profile?.username || profile?.full_name || user.email || 'User'}
                  </span>
                </Link>
                <button onClick={handleSignOut} className="sign-out-button">
                  Sign Out
                </button>
              </div>
            ) : (
              // Show login button when not logged in
              <Link to="/login" className="nav-button">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>
    );
  }

  export default Header;
