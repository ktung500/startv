import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Details from '../pages/Details';
import NewListing from '../pages/NewListing';
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/details" element={<Details />} />
    <Route path="/listing/new" element={<NewListing />} />
  </Routes>
);

export default AppRoutes;
