// src/components/PrivateRoute.jsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated'); // Verificamos la autenticación

  return (
    <Route
      {...rest}
      element={isAuthenticated ? element : <Navigate to="/login" />} // Si no está autenticado, redirigimos al login
    />
  );
};

export default PrivateRoute;
