import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../services/api';

const CategoryList = () => {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    categories.getAll().then(res => setCats(res.data));
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Kategóriák</h2>
      <div className="flex flex-wrap gap-3">
        {cats.map(cat => (
          <Link 
            key={cat.id} 
            to={`/category/${cat.id}`}
            className="bg-gray-200 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-full transition duration-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;