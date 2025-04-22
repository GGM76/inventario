// src/components/SearchBar.js
import React from 'react';
import { useLocation } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
  const location = useLocation();

  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  // Ajustamos el placeholder dependiendo de la ruta
  const placeholder = location.pathname.includes('/projects')
    ? 'Buscar proyectos...'
    : 'Buscar productos...';

  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={handleSearch}
      style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
    />
  );
};

export default SearchBar;
