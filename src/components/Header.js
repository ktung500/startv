import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import supabase from '../supabaseClient'

function Header() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Get the current user session from Supabase
      const getUser = async () => {
        setLoading(true);
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
  
      getUser();
  
      // Set up listener for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null);
        }
      );
  
      // Clean up subscription on unmount
      return () => {
        if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    }, []);
  
    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
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
            
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              // Show user info when logged in
              <div className="user-menu">
                <Link to="/profile" className="nav-button">
                <span className="username">{user.email || 'User'}</span>
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