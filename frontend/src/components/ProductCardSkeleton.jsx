import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="flex justify-center items-center bg-gray-200">
        <div className="w-full h-48 bg-gray-300"></div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;