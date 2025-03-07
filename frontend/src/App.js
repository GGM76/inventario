// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AddProductPage from './pages/AddProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        {/* Puedes agregar más rutas si lo deseas */}
      </Routes>
    </Router>
  );
};

export default App;
