import React, { useEffect, useState } from 'react';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Rating from '../ui/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

type Product = {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount: number;
  images: string[];
  stars?: number;
  reviews?: number;
};

const fetchProducts = async ({ pageParam = 0 }) => {
  const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=20&offset=${pageParam}&sort=newest`);
  return response.data;
};

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Page load হওয়ার সময় scroll position restore করুন
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('exploreScrollPosition');
    
    if (savedScrollPosition) {
      setScrollPosition(parseInt(savedScrollPosition));
    }
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['exploreProducts'],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 20 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  const products = data?.pages.flat() || [];

  // Products load হওয়ার পর scroll position restore করুন
  useEffect(() => {
    if (products.length > 0 && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        sessionStorage.removeItem('exploreScrollPosition');
        setScrollPosition(0);
      }, 100);
    }
  }, [products.length, scrollPosition]);

  const handleProductClick = (productId: string) => {
    // Current scroll position save করুন
    const currentScrollPosition = window.pageYOffset;
    sessionStorage.setItem('exploreScrollPosition', currentScrollPosition.toString());
    
    navigate(`/details/${productId}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login first');
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

      if (response.data?.success) {
        toast.success(response.data.message || 'Product added to wishlist.');
      } else {
        toast.error(response.data.message || 'Failed to add to wishlist.');
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to add to wishlist.');
      } else if (error.request) {
        toast.error('No response received from server. Please check your network connection.');
      } else {
        toast.error(error.message);
      }
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['exploreProducts'] });
    sessionStorage.removeItem('exploreScrollPosition');
    window.scrollTo(0, 0);
  };

  // Navigation functions for arrow buttons
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Responsive Skeleton for Vertical Products
  const renderVerticalSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="relative w-full h-64 sm:h-72 md:h-80 border rounded-lg">
          <Skeleton height="60%" className="rounded-t-lg" />
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 h-4 sm:h-5 md:h-6 w-10 sm:w-12 md:w-16">
            <Skeleton />
          </div>
          <div className="p-2 sm:p-3 md:p-4">
            <Skeleton height={14} width="80%" />
            <Skeleton height={12} width="60%" className="mt-1" />
            <Skeleton height={10} width="40%" className="mt-1" />
            <Skeleton height={24} width="100%" className="mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-20 mt-16 sm:mt-20">
        <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton width={8} height={20} className="sm:w-3 sm:h-7" />
              <Skeleton width={80} height={16} className="sm:w-24" />
            </div>
            <Skeleton width={150} height={24} className="mt-2 sm:mt-4 sm:w-48 sm:h-8" />
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            <Skeleton width={32} height={32} className="rounded-full sm:w-10 sm:h-10" />
            <Skeleton width={32} height={32} className="rounded-full sm:w-10 sm:h-10" />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <Skeleton width={100} height={18} className="sm:w-32 sm:h-5" />
            <Skeleton width={60} height={24} className="rounded sm:w-20" />
          </div>
          {renderVerticalSkeleton()}
        </div>
        <div className="text-center mt-4 sm:mt-6">
          <Skeleton width={100} height={32} className="rounded sm:w-32 sm:h-9" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 sm:py-10 text-red-500 px-4">
        <p className="text-sm sm:text-base">Error: {error.message}</p>
        <button 
          onClick={handleRefresh}
          className="mt-3 sm:mt-4 bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-20 mt-16 sm:mt-20">
      {/* Header Section - More Responsive */}
      <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="h-5 sm:h-6 md:h-7 w-2 sm:w-2.5 md:w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold text-sm sm:text-base">Featured</div>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-2 sm:mt-4">New Arrival</h1>
        </div>
        <div className="flex space-x-2 sm:space-x-3 text-lg sm:text-xl">
          <button 
            onClick={scrollToTop}
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            title="Scroll to top"
          >
            <GoArrowLeft size={16} className="sm:hidden" />
            <GoArrowLeft size={20} className="hidden sm:block" />
          </button>
          <button 
            onClick={scrollToBottom}
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            title="Scroll to bottom"
          >
            <GoArrowRight size={16} className="sm:hidden" />
            <GoArrowRight size={20} className="hidden sm:block" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">All Products</h2>
          {/* Refresh button - mobile optimized */}
          <button 
            onClick={handleRefresh}
            className="text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {/* Product Grid - Highly Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {products.map((product: Product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="relative w-full h-64 sm:h-72 md:h-80 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-24 sm:h-32 md:h-40 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 h-4 sm:h-5 md:h-6 flex items-center justify-center w-10 sm:w-12 md:w-16 bg-red-500 text-white text-xs sm:text-sm rounded-sm">
                -{product.discount}%
              </div>
              <div className="p-2 sm:p-3 md:p-4">
                <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate leading-tight">
                  {product.name}
                </h1>
                <div className="flex space-x-1 sm:space-x-2 md:space-x-3 items-center mt-1">
                  <p className="text-sm sm:text-base md:text-lg font-bold">৳{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-xs sm:text-sm text-red-400 line-through">৳{product.oldPrice}</p>
                  )}
                </div>
                {/* Rating component - scaled for mobile */}
                <div className="scale-75 sm:scale-90 md:scale-100 origin-left mt-0.5 sm:mt-1">
                  <Rating productId={product._id} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="mt-2 sm:mt-3 md:mt-4 w-full py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-all hover:scale-95 active:scale-90"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Section - Mobile Optimized */}
      {hasNextPage ? (
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={() => fetchNextPage()}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      ) : (
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base">
          No more products available
        </div>
      )}
    </div>
  );
};

export default Explore;