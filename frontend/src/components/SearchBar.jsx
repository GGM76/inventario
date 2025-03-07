// src/components/SearchBar.js
import React from 'react';

const SearchBar = ({ onSearch }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search products..."
      onChange={handleSearch}
    />
  );
};

export default SearchBar;
