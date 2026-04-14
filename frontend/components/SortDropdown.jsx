import React from 'react';

const SortDropdown = ({ sort, onSortChange }) => {
  return (
    <select
      value={sort}
      onChange={(e) => onSortChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Alapértelmezett</option>
      <option value="price_asc">Ár növekvő</option>
      <option value="price_desc">Ár csökkenő</option>
    </select>
  );
};

export default SortDropdown;