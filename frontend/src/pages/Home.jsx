import React, { useEffect, useState } from 'react';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import ProductCard from '../components/ProductCard';
import { products } from '../services/api';

const Home = () => {
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    products.getAll(params).then(res => setProductList(res.data));
  }, [search, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryList />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-6">
        <SearchBar onSearch={setSearch} />
        <SortDropdown sort={sort} onSortChange={setSort} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;