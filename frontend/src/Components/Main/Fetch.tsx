import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { GoArrowRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import Rating from '../ui/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  stars?: number;
  reviews?: number;
  size?: string;
  images: string[];
  discount?: number;
  category?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchProducts = async ({ pageParam = 0 }) => {
  const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=20&offset=${pageParam}`);
  return response.data;
};

// Default timer values for a static display (Bangladesh context)
const getDefaultTimer = () => ({
  days: 15,
  hours: 12,
  minutes: 30,
  seconds: 45
});

const ProductList: React.FC = () => {
  const queryClientInstance = useQueryClient();
  const [timer] = useState(getDefaultTimer()); // Static timer for Bangladesh users
  const [showVerticalProducts, setShowVerticalProducts] = useState(false);
  const [horizontalScrollPosition, setHorizontalScrollPosition] = useState(0);
  const [isWakeupNoticeDismissed, setIsWakeupNoticeDismissed] = useState(() => {
    return localStorage.getItem('backendWakeupNoticeDismissed') === 'true';
  });
  const [isFirstSessionLoad, setIsFirstSessionLoad] = useState(() => {
    return sessionStorage.getItem('backendWarmedUp') !== 'true';
  });
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // State এবং scroll position restore করুন
  useEffect(() => {
    const savedVerticalState = sessionStorage.getItem('showVerticalProducts');
    const savedPageScroll = sessionStorage.getItem('pageScrollPosition');
    const savedHorizontalScroll = sessionStorage.getItem('horizontalScrollPosition');
    
    if (savedVerticalState === 'true') {
      setShowVerticalProducts(true);
    }
    
    if (savedPageScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPageScroll));
        sessionStorage.removeItem('pageScrollPosition');
      }, 100);
    }

    if (savedHorizontalScroll) {
      setHorizontalScrollPosition(parseInt(savedHorizontalScroll));
    }
  }, []);

  // Cache থেকে data check করুন
  useEffect(() => {
    const cachedVerticalData = queryClientInstance.getQueryData(['verticalProducts']);
    if (cachedVerticalData) {
      setShowVerticalProducts(true);
    }
  }, [queryClientInstance]);

  // Horizontal Products
  const { data: horizontalProducts = [], isLoading: horizontalLoading } = useQuery<Product[]>({
    queryKey: ['horizontalProducts'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=8&offset=0`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (horizontalProducts.length > 0) {
      setIsFirstSessionLoad((previous) => {
        if (!previous) {
          return false;
        }
        sessionStorage.setItem('backendWarmedUp', 'true');
        return false;
      });
    }
  }, [horizontalProducts]);

  const dismissWakeupNotice = useCallback(() => {
    localStorage.setItem('backendWakeupNoticeDismissed', 'true');
    setIsWakeupNoticeDismissed(true);
  }, []);

  const wakeupNoticeBanner = useMemo(() => {
    return isWakeupNoticeDismissed ? null : (
      <div className="mb-4 sm:mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 sm:p-4 text-amber-900">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs sm:text-sm leading-relaxed">
             Note: The backend is hosted on a free-tier service, so the first request may take 20–60 seconds while the server wakes up. After that, the application should perform normally.
          </p>
          <button
            type="button"
            onClick={dismissWakeupNotice}
            className="text-amber-800 hover:text-amber-950 text-base leading-none"
            aria-label="Dismiss backend wake-up notice"
          >
            ×
          </button>
        </div>
      </div>
    );
  }, [dismissWakeupNotice, isWakeupNoticeDismissed]);

  // Horizontal scroll position restore করুন
  useEffect(() => {
    if (horizontalProducts.length > 0 && horizontalScrollPosition > 0 && horizontalContainerRef.current) {
      setTimeout(() => {
        if (horizontalContainerRef.current) {
          horizontalContainerRef.current.scrollLeft = horizontalScrollPosition;
          sessionStorage.removeItem('horizontalScrollPosition');
        }
      }, 100);
    }
  }, [horizontalProducts.length, horizontalScrollPosition]);

  // Vertical Products
  const {
    data: verticalPages,
    fetchNextPage: fetchMoreVertical,
    hasNextPage: hasMoreVertical,
    isFetchingNextPage: verticalLoading,
    isLoading: verticalInitialLoading,
  } = useInfiniteQuery({
    queryKey: ['verticalProducts'],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 20 : undefined;
    },
    enabled: showVerticalProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const verticalProducts = verticalPages?.pages.flat() || [];

  const handleLoadAllProducts = () => {
    setShowVerticalProducts(true);
    sessionStorage.setItem('showVerticalProducts', 'true');
  };

  const handleProductClick = (product: Product) => {
    sessionStorage.setItem('pageScrollPosition', window.pageYOffset.toString());
    
    if (horizontalContainerRef.current) {
      sessionStorage.setItem('horizontalScrollPosition', horizontalContainerRef.current.scrollLeft.toString());
    }
    
    if (showVerticalProducts) {
      sessionStorage.setItem('showVerticalProducts', 'true');
    }
    
    navigate(`/details/${product._id}`);
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

  const loadMoreHorizontal = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/products?limit=20&offset=${horizontalProducts.length}`
      );
      const newProducts = response.data;

      if (newProducts.length === 0) {
        alert('No more products available.');
        return;
      }

      queryClientInstance.setQueryData(['horizontalProducts'], (old: Product[] | undefined) => {
        const existingIds = new Set(old?.map((p) => p._id));
        const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p._id));
        return [...(old || []), ...uniqueNewProducts];
      });

      if (horizontalContainerRef.current) {
        horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading more products!', error);
    }
  };

  // Responsive skeleton components
  const renderHorizontalSkeleton = () => (
    <div className="flex overflow-x-auto space-x-2 sm:space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="relative w-40 sm:w-48 md:w-56 h-64 sm:h-72 md:h-80 border rounded-lg flex-shrink-0">
          <Skeleton height="60%" className="rounded-t-lg" />
          <div className="absolute top-2 left-2 h-4 sm:h-5 md:h-6 w-12 sm:w-14 md:w-16">
            <Skeleton />
          </div>
          <div className="p-2 sm:p-3 md:p-4">
            <Skeleton height={16} width="80%" />
            <Skeleton height={14} width="60%" className="mt-1 sm:mt-2" />
            <Skeleton height={12} width="40%" className="mt-1 sm:mt-2" />
            <Skeleton height={28} width="100%" className="mt-2 sm:mt-3 md:mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderVerticalSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="relative w-full h-64 sm:h-72 md:h-80 border rounded-lg">
          <Skeleton height="60%" className="rounded-t-lg" />
          <div className="absolute top-2 left-2 h-4 sm:h-5 md:h-6 w-10 sm:w-12 md:w-16">
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

  if (horizontalLoading) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 sm:py-6 md:py-10">
        {wakeupNoticeBanner}
        {isFirstSessionLoad && (
          <div className="mb-4 sm:mb-6 rounded-md border border-blue-200 bg-blue-50 p-3 sm:p-4 text-blue-900">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
              <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              Waking up server...
            </div>
          </div>
        )}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="h-5 sm:h-6 md:h-7 w-2 sm:w-2.5 md:w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold text-sm sm:text-base">Todays</div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-5">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold flex-1">
              <Skeleton width={150} />
            </h1>
            <div className="flex space-x-2 sm:space-x-4 md:space-x-6 mt-3 sm:mt-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton width={30} height={12} />
                  <Skeleton width={20} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            <Skeleton width={150} />
          </h2>
          {renderHorizontalSkeleton()}
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 sm:py-6 md:py-10">
      {wakeupNoticeBanner}
      {/* Header Section - More Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="h-5 sm:h-6 md:h-7 w-2 sm:w-2.5 md:w-3 bg-red-500"></div>
          <div className="text-red-500 font-semibold text-sm sm:text-base">Todays</div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-5">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold flex-1">Flash Sale</h1>
          {/* Compact Timer for Mobile */}
          <div className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 mt-3 sm:mt-0">
            <div className="text-center min-w-[30px] sm:min-w-[40px]">
              <p className="text-xs sm:text-sm text-gray-600">Days</p>
              <p className="font-bold text-sm sm:text-base md:text-lg">{timer.days.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center min-w-[30px] sm:min-w-[40px]">
              <p className="text-xs sm:text-sm text-gray-600">Hours</p>
              <p className="font-bold text-sm sm:text-base md:text-lg">{timer.hours.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center min-w-[30px] sm:min-w-[40px]">
              <p className="text-xs sm:text-sm text-gray-600">Min</p>
              <p className="font-bold text-sm sm:text-base md:text-lg">{timer.minutes.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center min-w-[30px] sm:min-w-[40px]">
              <p className="text-xs sm:text-sm text-gray-600">Sec</p>
              <p className="font-bold text-sm sm:text-base md:text-lg">{timer.seconds.toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Section - More Responsive */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Featured Products</h2>
          <button
            onClick={loadMoreHorizontal}
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            disabled={horizontalLoading}
          >
            <GoArrowRight size={16} className="sm:hidden" />
            <GoArrowRight size={20} className="hidden sm:block md:hidden" />
            <GoArrowRight size={24} className="hidden md:block" />
          </button>
        </div>
        {horizontalLoading ? (
          renderHorizontalSkeleton()
        ) : (
          <div
            ref={horizontalContainerRef}
            className="flex overflow-x-auto space-x-2 sm:space-x-3 md:space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300"
          >
            {horizontalProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="relative w-40 sm:w-48 md:w-56 h-64 sm:h-72 md:h-80 border rounded-lg flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-24 sm:h-32 md:h-40 object-cover rounded-t-lg"
                />
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 h-4 sm:h-5 md:h-6 flex items-center justify-center w-10 sm:w-12 md:w-16 bg-red-500 text-white text-xs sm:text-sm rounded-sm">
                  -{product.discount}%
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate">{product.name}</h1>
                  <div className="flex space-x-1 sm:space-x-2 md:space-x-3 items-center">
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
                    className="mt-2 sm:mt-3 md:mt-4 w-full py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load All Products Button */}
      {!showVerticalProducts && (
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={handleLoadAllProducts}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded hover:bg-blue-600 transition-colors"
          >
            Load All Products
          </button>
        </div>
      )}

      {/* Vertical Grid Section - More Responsive */}
      {showVerticalProducts && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">All Products</h2>
          {verticalInitialLoading ? (
            renderVerticalSkeleton()
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {verticalProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="relative w-full h-64 sm:h-72 md:h-80 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-24 sm:h-32 md:h-40 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-1 sm:top-2 left-1 sm:left-2 h-4 sm:h-5 md:h-6 flex items-center justify-center w-10 sm:w-12 md:w-16 bg-red-500 text-white text-xs sm:text-sm rounded-sm">
                    -{product.discount}%
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h1 className="font-semibold text-sm sm:text-base md:text-lg truncate">{product.name}</h1>
                    <div className="flex space-x-1 sm:space-x-2 md:space-x-3 items-center">
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
                      className="mt-2 sm:mt-3 md:mt-4 w-full py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-all hover:scale-95"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMoreVertical ? (
            <div className="text-center mt-4 sm:mt-6">
              <button
                onClick={() => fetchMoreVertical()}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                disabled={verticalLoading}
              >
                {verticalLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          ) : (
            <div className="text-center mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base">No more products</div>
          )}
        </div>
      )}
    </div>
  );
};

const Fetch = () => <ProductList />;

export default Fetch;
