import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const authToken = localStorage.getItem('authToken');  // Verificamos si hay token

    return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
