import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { products, categories } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import Pagination from '../components/Pagination';

const CategoryPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    if (id) {
      categories.getById(id)
        .then(res => setCategoryName(res.data.name))
        .catch(() => setCategoryName('Kategória'));
    }
  }, [id]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearchParams({ page: 1, ...(value && { search: value }), ...(sort && { sort }) });
  };

  const handleSortChange = (value) => {
    setSort(value);
    setSearchParams({ page: 1, ...(search && { search }), ...(value && { sort: value }) });
  };

  useEffect(() => {
    const params = {};
    if (id) params.category_id = id;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    params.page = page;
    params.limit = limit;
    products.getAll(params).then(res => {
      setProductList(res.data.data);
      setTotalPages(res.data.totalPages);
    });
  }, [id, search, sort, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, ...(search && { search }), ...(sort && { sort }) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {categoryName ? `${categoryName} termékek` : 'Kategória termékek'}
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-6">
        <SearchBar onSearch={handleSearchChange} />
        <SortDropdown sort={sort} onSortChange={handleSortChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default CategoryPage;