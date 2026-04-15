import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:bg-gray-50 hover:opacity-90 transform hover:-translate-y-1 cursor-pointer group">
        <div className="flex justify-center items-center bg-gray-100 py-2">
          <img 
            src={product.image_url || 'https://via.placeholder.com/300'} 
            alt={product.name} 
            className="w-full max-h-48 object-contain" 
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
            {product.name}
          </h3>
          <p className="font-bold text-xl mt-2 text-gray-700 group-hover:text-blue-600 transition">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-gray-600 transition">
            Készlet: {product.stock}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;