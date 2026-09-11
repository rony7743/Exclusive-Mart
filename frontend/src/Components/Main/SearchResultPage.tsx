import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Rating from '../ui/Rating';
import {  Grid, List,  Search, TrendingUp } from 'lucide-react';
//import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  brand?: string;
  weight?: number;
  size?: string;
  images: string[];
  tags: string[];
  discount?: number;
  category?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SearchResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  suggestions?: string[];
}

const PAGE_SIZE = 20;

const fetchSearchResults = async (query: string, page: number, sortBy: string = 'relevance', category: string = ''): Promise<SearchResponse> => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${PAGE_SIZE}&sort=${sortBy}&category=${category}`;
  const res = await axios.get(url);
  return res.data;
};

const SearchResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const category = searchParams.get('category') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);
   const [showFilters, setShowFilters] = useState(false);
  console.log(showFilters);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowFilters(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  //const { authData } = useAuth?.() || {};
  //let userId = null;
  // if (authData?.userId) {
  //   userId = authData.userId;
  // } else {
  //   const localUser = localStorage.getItem('user');
  //   if (localUser) {
  //     try {
  //       userId = JSON.parse(localUser).userId;
  //     } catch {}
  //   }
  // }

  const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please log in First');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/addwishlist`,
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success(`${product.name} has been added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };



  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<SearchResponse, Error>({
    queryKey: ['search', query, page, sortBy, category],
    queryFn: () => fetchSearchResults(query, page, sortBy, category),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/details/${productId}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Enhanced Loading Skeleton Components
  const HeaderSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Info Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton circle width={24} height={24} />
          <Skeleton height={24} width={200} className="sm:w-80" />
        </div>
        
        {/* Results Count Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton height={16} width={150} className="sm:w-48" />
          <Skeleton height={16} width={80} className="sm:w-32" />
        </div>
        
        {/* Controls Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex border rounded-lg overflow-hidden shadow-sm">
            <Skeleton height={40} width={40} className="sm:h-12 sm:w-12" />
            <Skeleton height={40} width={40} className="sm:h-12 sm:w-12" />
          </div>
          <Skeleton height={40} width={120} className="rounded-lg sm:w-40" />
          <Skeleton height={40} width={100} className="rounded-lg sm:w-32" />
        </div>
      </div>
    </div>
  );

  const GridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
      {Array.from({ length: isMobile ? 8 : 15 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Image Skeleton */}
          <div className="relative">
            <Skeleton height={isMobile ? 120 : 180} className="w-full" />
            {/* Discount Badge Skeleton */}
            <div className="absolute top-2 left-2">
              <Skeleton width={40} height={20} className="rounded-full" />
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="p-2 sm:p-3">
            <Skeleton height={14} className="mb-2" />
            <Skeleton height={12} width="60%" className="mb-2" />
            <Skeleton height={12} width="40%" className="mb-3" />
            
            {/* Price Skeleton */}
            <div className="flex items-center gap-2 mb-3">
              <Skeleton height={16} width={50} />
              <Skeleton height={12} width={40} />
            </div>
            
            {/* Button Skeleton */}
            <Skeleton height={32} className="w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: isMobile ? 5 : 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 md:p-4">
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            {/* Image Skeleton */}
            <div className="relative flex-shrink-0">
              <Skeleton 
                width={isMobile ? 80 : 120} 
                height={isMobile ? 80 : 120} 
                className="rounded-lg" 
              />
              {/* Discount Badge Skeleton */}
              <div className="absolute top-1 left-1">
                <Skeleton width={30} height={16} className="rounded-full" />
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="flex-1 min-w-0">
              <Skeleton height={16} className="mb-2 sm:mb-3" />
              <Skeleton height={12} width="40%" className="mb-2" />
              
              {/* Rating Skeleton */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width={12} height={12} />
                ))}
                <Skeleton width={30} height={12} className="ml-2" />
              </div>
              
              {/* Description Skeleton */}
              <Skeleton count={2} height={12} className="mb-3" />
              
              {/* Price Skeleton */}
              <div className="flex items-center gap-2 mb-3">
                <Skeleton height={18} width={60} />
                <Skeleton height={14} width={50} />
              </div>
              
              {/* Actions Skeleton */}
              <div className="flex gap-2">
                <Skeleton height={36} className="flex-1 rounded" />
                <Skeleton height={36} width={36} className="rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PaginationSkeleton = () => (
    <div className="mt-6 sm:mt-8">
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
        {/* Mobile Pagination Skeleton */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          <Skeleton height={36} width={60} className="rounded-lg" />
          <Skeleton height={20} width={40} />
          <Skeleton height={36} width={60} className="rounded-lg" />
        </div>

        {/* Desktop Pagination Skeleton */}
        <div className="hidden sm:flex justify-center items-center gap-2 md:gap-4">
          <Skeleton height={40} width={80} className="rounded-lg" />
          
          <div className="flex gap-1 md:gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={40} width={40} className="rounded-lg" />
            ))}
          </div>
          
          <Skeleton height={40} width={80} className="rounded-lg" />
        </div>
      </div>
    </div>
  );


  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
      {products.map((product: Product) => (
        <div
          key={product._id}
          className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col h-full"
          onClick={() => handleProductClick(product._id)}
        >
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.images?.[0] || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
            />
            {product.discount && product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-xs">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-2 sm:p-3 flex flex-col flex-1">
            <h3 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium truncate">{product.brand}</p>
            )}
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <span className="font-bold text-xs sm:text-sm text-red-600">৳{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <div className="mt-auto">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.inStock}
                onClick={e => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      {products.map((product: Product) => (
        <div
          key={product._id}
          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-2 sm:p-3 md:p-4 group cursor-pointer"
          onClick={() => handleProductClick(product._id)}
        >
          <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 items-stretch">
            <div className="relative flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-40 h-24 sm:h-28 md:h-32 lg:h-40">
              <img
                src={product.images?.[0] || '/placeholder-product.png'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              {product.discount && product.discount > 0 && (
                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full">
                  -{product.discount}%
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
                  Brand: <span className="font-medium">{product.brand}</span>
                </p>
              )}
              <div className="mb-1">
                <Rating productId={product._id} />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2">
                {product.description || 'No description available'}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <span className="font-bold text-xs sm:text-sm md:text-base text-red-600">৳{product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
                )}
              </div>
              <div className="flex mt-auto">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs md:text-sm py-1.5 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!product.inStock}
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!query) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center py-12 sm:py-20">
          <Search size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-600 mb-3 sm:mb-4">Search for something</h2>
          <p className="text-sm sm:text-base text-gray-500">Type in the search box to find your favorite products</p>
        </div>
      </div>
    );
  }

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
          {/* Loading State */}
          {isLoading ? (
            <>
              <HeaderSkeleton />
              {viewMode === 'grid' ? <GridSkeleton /> : <ListSkeleton />}
              <PaginationSkeleton />
            </>
          ) : isError ? (
            // Error State
            <div className="text-center py-12 sm:py-20">
              <div className="text-red-500 text-base sm:text-lg font-semibold mb-2">Something went wrong</div>
              <p className="text-sm sm:text-base text-gray-600">
                {error instanceof Error ? error.message : 'Could not fetch data from server.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Enhanced Search Header */}
              <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Search Info */}
                  <div className="flex items-center gap-2">
                    <Search size={20} className="text-blue-600" />
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                      Search Results for "{query}"
                    </h1>
                  </div>
                  
                  {/* Results Count */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {total > 0 ? `Showing ${((page - 1) * PAGE_SIZE) + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total} results` : 'No results found'}
                    </span>
                    {total > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        Page {page} of {totalPages}
                      </span>
                    )}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="flex border rounded-lg overflow-hidden shadow-sm">
                      <button
                        className={`flex-1 sm:flex-none p-2 md:p-3 transition-colors duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                      >
                        <Grid size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className={`flex-1 sm:flex-none p-2 md:p-3 transition-colors duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                      >
                        <List size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    {/* Sort Dropdown */}
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="flex-1 sm:flex-none px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results */}
              {isFetching ? (
                viewMode === 'grid' ? <GridSkeleton /> : <ListSkeleton />
              ) : products.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <Search size={64} className="mx-auto text-gray-300 mb-4" />
                  <div className="text-gray-500 text-base sm:text-lg font-semibold mb-2">No products found</div>
                  <p className="text-sm sm:text-base text-gray-400">Try searching with different keywords</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? renderGridView() : renderListView()}
                  
                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 sm:mt-8">
                      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
                        {/* Mobile Pagination */}
                        <div className="flex sm:hidden items-center justify-between gap-2">
                          <button
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
                            disabled={page <= 1}
                            onClick={() => handlePageChange(page - 1)}
                          >
                            ← Prev
                          </button>
                          
                          <span className="px-3 py-2 text-sm font-medium text-gray-700">
                            {page} / {totalPages}
                          </span>
                          
                          <button
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                          >
                            Next →
                          </button>
                        </div>

                        {/* Desktop Pagination */}
                        <div className="hidden sm:flex justify-center items-center gap-2 md:gap-4">
                          <button
                            className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                            disabled={page <= 1}
                            onClick={() => handlePageChange(page - 1)}
                          >
                            ← Previous
                          </button>
                          
                          {/* Page Numbers */}
                          <div className="flex gap-1 md:gap-2 overflow-x-auto">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  className={`px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors duration-200 font-medium min-w-[40px] md:min-w-[44px] ${
                                    pageNum === page
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default SearchResultPage;