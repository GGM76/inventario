// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="navbar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/add-product">Add Product</Link>
      {/* Agrega otros enlaces si es necesario */}
    </div>
  );
};

export default Navbar;
