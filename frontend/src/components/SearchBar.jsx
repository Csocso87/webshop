import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [term, setTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setTerm(value);
    onSearch(value);
  };

  return (
    <input
      type="text"
      placeholder="Keresés termékre..."
      value={term}
      onChange={handleChange}
      className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
};

export default SearchBar;