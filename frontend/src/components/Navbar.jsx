// src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/reducers/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState('');
  const previousPathRef = useRef(location.pathname);
  const userRole = localStorage.getItem('userRole');

  // Limpiar la barra si cambia la sección
  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    const previousSection = previousPath.split('/')[1];
    const currentSection = currentPath.split('/')[1];

    if (previousSection !== currentSection) {
      setInputValue('');
      setSearchParams({});
    }

    previousPathRef.current = currentPath;
  }, [location.pathname, setSearchParams]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const currentPath = location.pathname;
    navigate(`${currentPath}?search=${encodeURIComponent(value)}`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmpresaId');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
      <Link to="/dashboard" style={{ marginRight: '10px' }}>Inventario</Link>
      <Link to="/projects" style={{ marginRight: '10px' }}>Proyectos</Link>

      {userRole === 'admin' && (
        <Link to="/manage-users" style={{ marginRight: '10px' }}>Administrar Usuarios</Link>
      )}

      <input
        type="text"
        placeholder="Buscar..."
        value={inputValue}
        onChange={handleChange}
        style={{ marginLeft: '20px', marginRight: 'auto' }}
      />

      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Cerrar sesión</button>
    </nav>
  );
};

export default Navbar;
