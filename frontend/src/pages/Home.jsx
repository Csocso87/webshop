import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Pagination from '../components/Pagination';
import { products } from '../services/api';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const page = parseInt(searchParams.get('page') || '1', 10);

  const handleSearchChange = (value) => {
    setSearch(value);
    setSearchParams({ page: 1, ...(value && { search: value }), ...(sort && { sort }) });
  };

  const handleSortChange = (value) => {
    setSort(value);
    setSearchParams({ page: 1, ...(search && { search }), ...(value && { sort: value }) });
  };

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    params.page = page;
    params.limit = limit;
    products.getAll(params).then(res => {
      setProductList(res.data.data);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    });
  }, [search, sort, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, ...(search && { search }), ...(sort && { sort }) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryList />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-6">
        <SearchBar onSearch={handleSearchChange} />
        <SortDropdown sort={sort} onSortChange={handleSortChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(limit).fill().map((_, index) => <ProductCardSkeleton key={index} />)
        ) : (
          productList.map(product => <ProductCard key={product.id} product={product} />)
        )}
      </div>
      {totalPages > 1 && !loading && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default Home;