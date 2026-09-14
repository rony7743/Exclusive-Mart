import React, { useRef, useEffect, useState } from 'react';
import { GoArrowRight } from 'react-icons/go';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Rating from '../ui/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  oldPrice?: number;
  discount: number;
  stars?: number;
  reviews?: number;
}

const API_URL = `${import.meta.env.VITE_APP_API_URL}/api/products`;

// Default timer values
const getDefaultTimer = () => ({
  hours: 23,
  days: 5,
  minutes: 59,
  seconds: 35
});

const BestSellingComponent: React.FC = () => {
  const navigate = useNavigate();
  const queryClientInstance = useQueryClient();
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [horizontalScrollPosition, setHorizontalScrollPosition] = useState(0);
  const [timer] = useState(getDefaultTimer()); // Static timer

  // State এবং scroll positions restore করুন
  useEffect(() => {
    const savedPageScroll = sessionStorage.getItem('bestSellingPageScrollPosition');
    const savedHorizontalScroll = sessionStorage.getItem('bestSellingHorizontalScrollPosition');
    
    if (savedPageScroll) {
      setScrollPosition(parseInt(savedPageScroll));
    }
    
    if (savedHorizontalScroll) {
      setHorizontalScrollPosition(parseInt(savedHorizontalScroll));
    }
  }, []);

  // Horizontal Products Query
  const {
    data: horizontalProducts,
    fetchNextPage: fetchMoreHorizontal,
    isFetchingNextPage: horizontalLoading,
    isLoading: horizontalInitialLoading,
    error: horizontalError,
  } = useInfiniteQuery({
    queryKey: ['bestSellingHorizontal'],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const response = await axios.get(`${API_URL}?limit=8&offset=${pageParam}&sort=best_selling`);
      return response.data as Product[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 8 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const flattenedHorizontalProducts = horizontalProducts?.pages?.flat() || [];

  // Page scroll position restore করুন
  useEffect(() => {
    if (flattenedHorizontalProducts.length > 0 && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        sessionStorage.removeItem('bestSellingPageScrollPosition');
        setScrollPosition(0);
      }, 100);
    }
  }, [flattenedHorizontalProducts.length, scrollPosition]);

  // Horizontal scroll position restore করুন
  useEffect(() => {
    if (flattenedHorizontalProducts.length > 0 && horizontalScrollPosition > 0 && horizontalContainerRef.current) {
      setTimeout(() => {
        if (horizontalContainerRef.current) {
          horizontalContainerRef.current.scrollLeft = horizontalScrollPosition;
          sessionStorage.removeItem('bestSellingHorizontalScrollPosition');
          setHorizontalScrollPosition(0);
        }
      }, 100);
    }
  }, [flattenedHorizontalProducts.length, horizontalScrollPosition]);

  const loadMoreHorizontal = async () => {
    await fetchMoreHorizontal();
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleViewMore = () => {
    loadMoreHorizontal();
  };

  const handleProductClick = (productId: string) => {
    // Page scroll position save করুন
    const currentScrollPosition = window.pageYOffset;
    sessionStorage.setItem('bestSellingPageScrollPosition', currentScrollPosition.toString());
    
    // Horizontal scroll position save করুন
    if (horizontalContainerRef.current) {
      sessionStorage.setItem('bestSellingHorizontalScrollPosition', horizontalContainerRef.current.scrollLeft.toString());
    }
    
    navigate(`/details/${productId}`);
  };

  // Add to Cart Function
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
    queryClientInstance.invalidateQueries({ queryKey: ['bestSellingHorizontal'] });
    sessionStorage.removeItem('bestSellingPageScrollPosition');
    sessionStorage.removeItem('bestSellingHorizontalScrollPosition');
    window.scrollTo(0, 0);
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollLeft = 0;
    }
  };

  // Responsive Skeleton for Horizontal Products
  const renderHorizontalSkeleton = () => (
    <div className="flex overflow-x-auto space-x-2 sm:space-x-3 md:space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="relative w-40 sm:w-48 md:w-56 h-64 sm:h-72 md:h-80 border rounded-lg flex-shrink-0 bg-white"
        >
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

  if (horizontalInitialLoading) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-20">
        {/* Header Skeleton - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton width={8} height={20} className="sm:w-3 sm:h-7" />
              <Skeleton width={80} className="sm:w-24" />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-2 sm:mt-4">
              <Skeleton width={180} className="sm:w-48" />
            </h1>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
            <Skeleton width={80} height={32} className="rounded-lg sm:w-24 sm:h-10" />
            <Skeleton width={32} height={32} className="rounded-lg sm:w-10 sm:h-10" />
          </div>
        </div>
        {/* Products Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              <Skeleton width={80} className="sm:w-24" />
            </h2>
            <Skeleton width={32} height={32} className="rounded-full sm:w-10 sm:h-10" />
          </div>
          {renderHorizontalSkeleton()}
        </div>
        {/* Banner Section Skeleton */}
        <div className="bg-gray-200 flex flex-col-reverse md:flex-row h-auto md:h-[50vh] lg:h-[60vh] xl:h-[100vh] rounded-lg">
          <div className="flex-1 space-y-4 sm:space-y-6 md:space-y-8 flex flex-col justify-center items-start px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-0">
            <Skeleton width={60} height={16} className="sm:w-20" />
            <Skeleton count={2} width={200} height={24} className="sm:w-80 sm:h-8" />
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} width={60} height={60} circle className="sm:w-16 sm:h-16 md:w-20 md:h-20" />
              ))}
            </div>
            <Skeleton width={100} height={32} className="rounded-md sm:w-32 sm:h-12 md:w-36 md:h-16" />
          </div>
          <div className="flex-1 h-[200px] sm:h-[250px] md:h-auto">
            <Skeleton height="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (horizontalError) {
    return (
      <div className="text-center py-8 sm:py-10 text-red-500 px-4">
        <p className="text-sm sm:text-base">Error loading products</p>
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
    <div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-20">
      {/* Header - More Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div className="w-full sm:w-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="h-5 sm:h-6 md:h-7 w-2 sm:w-2.5 md:w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold text-sm sm:text-base">This Month</div>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-2 sm:mt-4">
            Best Selling Products
          </h1>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={handleViewMore}
            className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={horizontalLoading}
          >
            {horizontalLoading ? 'Loading...' : 'View More'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
            title="Refresh products"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Products - Highly Responsive */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Top Picks</h2>
          <button
            onClick={loadMoreHorizontal}
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            disabled={horizontalLoading}
            title="Load more products"
          >
            <GoArrowRight size={16} className="sm:hidden" />
            <GoArrowRight size={20} className="hidden sm:block md:hidden" />
            <GoArrowRight size={24} className="hidden md:block" />
          </button>
        </div>

        <div
          ref={horizontalContainerRef}
          className="flex overflow-x-auto space-x-2 sm:space-x-3 md:space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {flattenedHorizontalProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="relative w-40 sm:w-48 md:w-56 h-64 sm:h-72 md:h-80 border rounded-lg flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-24 sm:h-32 md:h-40 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 h-4 sm:h-5 md:h-6 w-10 sm:w-12 md:w-16 flex items-center justify-center bg-red-500 text-white text-xs sm:text-sm rounded-sm">
                -{product.discount}%
              </div>
              <div className="p-2 sm:p-3 md:p-4">
                <h1 className="font-semibold text-sm sm:text-base truncate">{product.name}</h1>
                <div className="flex space-x-1 sm:space-x-2 items-center mt-1">
                  <p className="text-sm sm:text-base md:text-lg font-bold">৳{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-xs sm:text-sm text-red-400 line-through">৳{product.oldPrice}</p>
                  )}
                </div>
                <div className="scale-75 sm:scale-90 md:scale-100 origin-left">
                  <Rating productId={product._id} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="mt-2 sm:mt-3 md:mt-4 w-full py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-all hover:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {horizontalLoading && (
          <div className="text-center py-3 sm:py-4 text-gray-600 text-sm sm:text-base">
            Loading more products...
          </div>
        )}
      </div>

      {/* Banner Section - Highly Responsive */}
      <div className="bg-black flex flex-col-reverse md:flex-row h-auto md:h-[50vh] lg:h-[60vh] xl:h-[100vh] rounded-lg overflow-hidden">
        {/* Text section - Mobile Optimized */}
        <div className="text-white flex-1 space-y-4 sm:space-y-6 md:space-y-8 flex flex-col justify-center items-start px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-0">
          <p className="text-[#00FF66] text-xs sm:text-sm md:text-base">Categories</p>
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight">
            Enhance Your <br /> Music Experience
          </h1>

          {/* Countdown - More Responsive */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            {[
              { value: timer.hours.toString().padStart(2, '0'), label: "Hours" },
              { value: timer.days.toString().padStart(2, '0'), label: "Days" },
              { value: timer.minutes.toString().padStart(2, '0'), label: "Minutes" },
              { value: timer.seconds.toString().padStart(2, '0'), label: "Seconds" },
            ].map((item, index) => (
              <div
                key={index}
                className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 flex flex-col justify-center items-center font-semibold bg-white text-black rounded-full hover:scale-105 transition-transform"
              >
                <p className="text-sm sm:text-base md:text-lg">{item.value}</p>
                <p className="text-xs sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Button - Responsive */}
          <button className="bg-[#00FF66] text-black w-24 sm:w-28 md:w-32 lg:w-36 h-10 sm:h-12 md:h-14 lg:h-16 rounded-md hover:scale-95 transition duration-200 flex justify-center items-center font-semibold text-sm sm:text-base">
            Buy Now
          </button>
        </div>

        {/* Image section - Responsive */}
        <div
          className="flex-1 bg-no-repeat bg-center bg-contain h-[200px] sm:h-[250px] md:h-auto"
          style={{ backgroundImage: "url(/figma/hadphone.svg)" }}
        ></div>
      </div>
    </div>
  );
};

const BestSelling = () => <BestSellingComponent />;

export default BestSelling;
