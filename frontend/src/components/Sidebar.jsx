// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Inventory</h2>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/add-product">Add Product</Link></li>
        {/* Más enlaces según sea necesario */}
      </ul>
    </div>
  );
};

export default Sidebar;
