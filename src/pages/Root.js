import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import '../App.css';

const Root = () => {
    return (
        <div>
            <nav>
                STAR
            </nav>
            <div className = 'nav-links'>
                <Link to="/" className = 'nav-link'>Home</Link>
                <Link to="/details" className = 'nav-link' >Details</Link>
            </div>
            <Outlet />

        </div>
    )
};

export default Root