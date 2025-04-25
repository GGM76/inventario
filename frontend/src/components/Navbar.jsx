import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/reducers/authSlice';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const menuRef = useRef(null);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setShowMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const currentPath = location.pathname;
    navigate(`${currentPath}?search=${encodeURIComponent(value)}`, { replace: true });
  };

  const getTitleFromPath = (path) => {
    if (path.includes('/projects')) return 'Proyectos';
    if (path.includes('/manage-users')) return 'Administración';
    return 'Inventario';
  };
  
  const currentTitle = getTitleFromPath(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
    setShowMobileSearch(false);
  };

  const handleSearchIconClick = () => {
    setShowMobileSearch(!showMobileSearch);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="menu-toggle" onClick={handleMenuClick}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <div className="navbar-title">{currentTitle}</div>
        <div className="navbar-links">
          <Link to="/dashboard">Inventario</Link>
          <Link to="/projects">Proyectos</Link>
          {userRole === 'admin' && (
            <Link to="/manage-users">Administrar Usuarios</Link>
          )}
        </div>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          className={`navbar-search ${showMobileSearch ? 'visible' : ''}`}
          placeholder="Buscar..."
          value={inputValue}
          onChange={handleChange}
        />
        <FaSearch className="search-icon" onClick={handleSearchIconClick} />
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {/* Modal solo en móvil */}
      {menuOpen && (
        <div className="navbar-modal" ref={menuRef}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Inventario</Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>Proyectos</Link>
          {userRole === 'admin' && (
            <Link to="/manage-users" onClick={() => setMenuOpen(false)}>Administrar Usuarios</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
