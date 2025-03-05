import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
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
            <Link to="/listing/new" className="nav-button">
                List your property
            </Link>
            <Link to="/login" className="nav-button">
                Sign In
            </Link>
            </div>
        </nav>
    </header>
)};
export default Header;