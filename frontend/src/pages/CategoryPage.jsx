import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { products, categories } from '../services/api';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { id } = useParams();
  const [productList, setProductList] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (id) {
      categories.getById(id)
        .then(res => setCategoryName(res.data.name))
        .catch(() => setCategoryName('Kategória'));
      products.getAll({ category_id: id }).then(res => setProductList(res.data));
    }
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {categoryName ? `${categoryName} termékek` : 'Kategória termékek'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;