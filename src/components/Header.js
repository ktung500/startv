import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../AuthContext';

/** Utility to get initials from name, fallback to "U" */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
                <Link to="/profile" >
                  <span className="nav-avatar-circle" style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#e3f6ea",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#2c6954",
                    marginRight: 7,
                    border: "2px solid #d2e6de",
                    overflow: "hidden",
                    verticalAlign: "middle"
                  }}>
                    {profile && profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                          display: "block"
                        }}
                        onError={e => {
                          // Hide img on error; show initials instead
                          e.target.style.display = "none";
                          e.target.parentNode.innerText = getInitials(profile.full_name);
                        }}
                      />
                    ) : (
                      getInitials(profile?.full_name) || "U"
                    )}
                  </span>
                </Link>
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
