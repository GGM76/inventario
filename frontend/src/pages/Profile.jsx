// src/pages/ProfilePage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Si el usuario no está logueado, redirigimos al login
  if (!user) {
    window.location.href = '/login';
  }

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';  // Redirigir al login después del logout
  };

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      {user ? (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          <p><strong>Empresa:</strong> {user.empresa_id}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default ProfilePage;
