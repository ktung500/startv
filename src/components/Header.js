import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
            <NavLink
              to="/"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/reservations"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Reservations
            </NavLink>

            <NavLink
              to="/listing/new"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              List your property
            </NavLink>

            <NavLink
              to="/myListings"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Manage Listings
            </NavLink>
            
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              // Show user info when logged in
              <div className="user-menu">
                <Link to="/profile" className="nav-link">
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
              <NavLink
                to="/login"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Sign In
              </NavLink>
            )}
          </div>
        </nav>
      </header>
    );
  }

  export default Header;
