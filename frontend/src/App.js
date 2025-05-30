// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProductPage from './pages/AddProduct';
import ProductDetailsPage from './pages/ProductDetails';
import AddProductToBodega from './pages/AddProductToBodega';
import ManageUsers from './pages/ManageUsers';
import Project from './pages/Project';
import ProjectDetail from './pages/ProjectDetail';
import AddProject from './pages/AddProject';
import AddSubproject from './pages/AddSubproject';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import MassProductUpload from './pages/MassProductUpload';
import UseHistory from './pages/UseHistory';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import './styles/App.css';

function App() {
  const location = useLocation();
  const empresa = localStorage.getItem('userEmpresaId') || 'default';
  //Aplica el tema 
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${empresa}`);
  }, [empresa]);

  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ToastContainer />
      <Routes>
        {/* Público */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas comunes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product-details/:id" element={<ProductDetailsPage />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        {/* Admin */}
        <Route path="/add-product" element={<AdminRoute><AddProductPage /></AdminRoute>} />
        <Route path="/add-product-to-bodega" element={<AdminRoute><AddProductToBodega /></AdminRoute>} />
        <Route path="/add-project" element={<AdminRoute><AddProject /></AdminRoute>} />
        <Route path="/:projectId/add-subproject" element={<AdminRoute><AddSubproject /></AdminRoute>} />
        <Route path="/manage-users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="/projects/:projectId/add-products" element={<AdminRoute><AddProject /></AdminRoute>} />
        <Route path="/projects/:id/historial" element={<AdminRoute><UseHistory /></AdminRoute>} />
        <Route path="/mass-product-upload" element={<AdminRoute><MassProductUpload /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App;
