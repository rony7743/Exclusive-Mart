import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { Button } from '../ui/Button';
import Reviews from './Reviews';
import Rating from '../ui/Rating';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

import socket, { syncSocketAuthToken } from '../../socket';
import NotFound from '../error/NotFound';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  discount: number;
  stars?: number;
  totalReviews?: number;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
  size?: string;
  category?: string;
  brand?: string;
  weight?: number;
  tags?: string[];
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stars?: number;
  discount?: number;
  oldPrice?: number;
}

const fetchProductDetails = async (productId: string): Promise<Product> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    throw new Error('Failed to fetch product details. Please try again later.');
  }
};

const fetchSimilarProducts = async (category: string | undefined, excludeId: string): Promise<SimilarProduct[]> => {
  if (!category) return [];
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API_URL}/api/products?category=${encodeURIComponent(category)}&limit=4&exclude=${excludeId}`
    );
    return response.data.products || response.data;
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    return [];
  }
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

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

      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.error('Product Add to Cart');
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to add to cart. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response received from server. Please check your network connection.');
      } else {
        toast.error(error.message);
      }
    } 
  };

  // save scroll position
  useEffect(() => {
    return () => {
      setScrollPositions(prev => ({
        ...prev,
        [location.pathname]: window.scrollY
      }));
    };
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const savedPosition = scrollPositions[location.pathname];
    if (savedPosition) {
      window.scrollTo(0, savedPosition);
    }
  }, [location, scrollPositions]);
  
  // Better user ID handling
  let userId = null;
  if (authData?.userId) {
    userId = authData.userId;
  } else {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        userId = userData?._id;
      } catch (err) {
        console.error("Invalid user data in localStorage");
      }
    }
  }

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetails(id!),
    enabled: !!id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: similarProducts, 
    isLoading: similarProductsLoading 
  } = useQuery<SimilarProduct[], Error>({
    queryKey: ['similarProducts', product?.category, id],
    queryFn: () => fetchSimilarProducts(product?.category, id!),
    enabled: !!product?.category && !!id,
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (product) {
      if (product.images?.length > 0 && !selectedImage) {
        setSelectedImage(product.images[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      } else if (product.size && !selectedSize) {
        setSelectedSize(product.size);
      }
    }
  }, [product, selectedImage, selectedColor, selectedSize]);

  const handleProductNavigation = (productId: string) => {
    navigate(`/details/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessageButtonClick = () => {
    if (!userId) {
      toast.info('Please login first');
      return;
    }
    syncSocketAuthToken(localStorage.getItem('token'));

    console.log('Starting chat for product:', { productId: id });

    socket.emit('start_chat', { productId: id });

    socket.once('chat_started', (conversation) => {
      console.log('Chat started:', conversation);
      navigate(`/messages/${conversation.id}`, {
        state: { user: conversation.user, name: conversation.name },
      });
    });

    setTimeout(() => {
      socket.off('chat_started');
    }, 10000);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x400.png?text=Image+Not+Found';
    setIsImageLoading(false);
  };

  // Skeleton Loading Components
  const ProductDetailsSkeleton = () => (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Main Product Section Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
        {/* Image Gallery Skeleton */}
        <div className="w-full lg:w-1/2">
          <div className="mb-3 sm:mb-4 bg-white rounded-lg shadow-md overflow-hidden border">
            <Skeleton height="64" className="sm:h-80 md:h-96 lg:h-[500px]" />
          </div>
          
          {/* Thumbnail Skeletons */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="64" className="sm:h-20 aspect-square rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4 lg:space-y-5">
          {/* Title and Brand */}
          <div>
            <Skeleton height={32} className="sm:h-10 lg:h-12 mb-2" />
            <Skeleton height={20} width="60%" className="sm:h-6" />
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Skeleton height={32} width={120} className="sm:h-10 lg:h-12" />
            <Skeleton height={24} width={80} className="sm:h-8" />
            <Skeleton height={24} width={100} className="rounded-full" />
          </div>

          {/* Rating Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton height={20} width={150} />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <Skeleton count={3} height={16} />
            <Skeleton height={16} width="70%" />
          </div>

          {/* Tags Skeleton */}
          <div className="space-y-2">
            <Skeleton height={20} width={60} />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={24} width={60} className="rounded-full" />
              ))}
            </div>
          </div>

          {/* Colors Skeleton */}
          <div className="space-y-2">
            <Skeleton height={20} width={100} />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={24} width={24} className="rounded-full sm:h-8 sm:w-8" />
              ))}
            </div>
          </div>

          {/* Sizes Skeleton */}
          <div className="space-y-2">
            <Skeleton height={20} width={80} />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={32} width={40} className="rounded-md" />
              ))}
            </div>
          </div>

          {/* Additional Info Skeleton */}
          <div className="space-y-1">
            <Skeleton height={16} width="70%" />
            <Skeleton height={16} width="50%" />
          </div>

          {/* Quantity Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton height={20} width={80} />
            <Skeleton height={40} width={120} className="rounded-md" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Skeleton height={44} className="flex-1 rounded-md" />
              <Skeleton height={44} className="flex-1 rounded-md" />
            </div>
            <Skeleton height={44} className="w-full rounded-md" />
          </div>

          {/* Features Skeleton */}
          <div className="space-y-1 pt-2 sm:pt-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={16} width="40%" />
            ))}
          </div>
        </div>
      </div>

      {/* Product Details Section Skeleton */}
      <section className="my-8 sm:my-10 lg:my-12 bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border">
        <Skeleton height={28} width={200} className="mb-4" />
        <div className="space-y-2">
          <Skeleton count={5} height={16} />
          <Skeleton height={16} width="80%" />
        </div>
      </section>

      {/* Reviews Section Skeleton */}
      <section className="my-8 sm:my-10 lg:my-12">
        <Skeleton height={28} width={150} className="mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton height={40} width={40} className="rounded-full" />
                <div className="flex-1">
                  <Skeleton height={16} width={120} />
                  <Skeleton height={14} width={80} />
                </div>
              </div>
              <Skeleton count={2} height={14} />
            </div>
          ))}
        </div>
      </section>

      {/* Similar Products Section Skeleton */}
      <section className="mt-12 sm:mt-14 lg:mt-16">
        <Skeleton height={28} width={250} className="mb-4 sm:mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border">
              <Skeleton height={128} className="sm:h-40 lg:h-56" />
              <div className="p-2 sm:p-3 lg:p-4">
                <Skeleton height={16} className="mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton height={20} width={60} />
                  <Skeleton height={16} width={80} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const SimilarProductsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border">
          <Skeleton height={128} className="sm:h-40 lg:h-56" />
          <div className="p-2 sm:p-3 lg:p-4">
            <Skeleton height={16} className="mb-2" />
            <div className="flex items-center justify-between">
              <Skeleton height={20} width={60} />
              <Skeleton height={16} width={80} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center py-8 sm:py-10 text-red-500">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Invalid Product</h2>
          <p className="text-sm sm:text-base">The product ID is missing or invalid.</p>
          <Button onClick={() => navigate('/')} className="mt-3 sm:mt-4 text-sm sm:text-base">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError || !product) {
    return (
      <div>
        <NotFound />
      </div>
    );
  }

  // Calculate actual discounted price
  const actualPrice = product.oldPrice && product.discount > 0 
    ? product.oldPrice - (product.oldPrice * product.discount / 100)
    : product.price;

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Main Product Section - More Responsive */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
        {/* Image Gallery - Mobile Optimized */}
        <div className="w-full lg:w-1/2">
          <div className="mb-3 sm:mb-4 bg-white rounded-lg shadow-md overflow-hidden border">
            {isImageLoading && (
              <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                <Skeleton height="100%" />
              </div>
            )}
            <img
              src={selectedImage || (product.images?.[0]) || 'https://via.placeholder.com/400x400.png?text=No+Image'}
              alt={product.name}
              className={`w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-contain p-2 ${isImageLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(img);
                    setIsImageLoading(true);
                  }}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === img ? 'border-blue-500 ring-1 sm:ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Mobile Optimized */}
        <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4 lg:space-y-5">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">by <span className="font-semibold">{product.brand}</span></p>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
              ৳{actualPrice.toLocaleString()}
            </span>
            {product.oldPrice && product.discount > 0 && (
              <>
                <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                  ৳{product.oldPrice.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                  -{product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Rating productId={product._id} initialRating={product.stars} totalReviews={product.totalReviews} />
          </div>

          {/* Mobile Description - Collapsible */}
          <div className="text-gray-600 leading-relaxed">
            <div className="block sm:hidden">
              {showFullDescription ? (
                <div>
                  <p className="text-sm">{product.description}</p>
                  <button 
                    onClick={() => setShowFullDescription(false)}
                    className="text-blue-600 text-sm mt-1 font-medium"
                  >
                    Show Less
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm">
                    {product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description
                    }
                  </p>
                  {product.description.length > 100 && (
                    <button 
                      onClick={() => setShowFullDescription(true)}
                      className="text-blue-600 text-sm mt-1 font-medium"
                    >
                      Read More
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Desktop Description */}
            <p className="hidden sm:block text-sm sm:text-base">
              {product.description.length > 200 
                ? `${product.description.substring(0, 200)}...` 
                : product.description
              }
            </p>
          </div>

          {/* Product Tags - Mobile Optimized */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Tags:</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colors - Mobile Optimized */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Color: <span className="font-normal">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                      selectedColor === c ? 'ring-1 sm:ring-2 ring-offset-1 ring-blue-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes - Mobile Optimized */}
          {((product.sizes && product.sizes.length > 0) || product.size) && (
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Size: <span className="font-normal">{selectedSize}</span></h3>
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2.5 sm:px-4 py-1 sm:py-1.5 border rounded-md text-xs sm:text-sm transition-colors ${
                        selectedSize === sz
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-800 rounded-md text-xs sm:text-sm">
                  {product.size}
                </span>
              )}
            </div>
          )}

          {/* Additional Info - Mobile Optimized */}
          {(product.weight || product.category) && (
            <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600">
              {product.category && <p><span className="font-semibold">Category:</span> {product.category}</p>}
              {product.weight && <p><span className="font-semibold">Weight:</span> {product.weight}g</p>}
            </div>
          )}

          {/* Quantity - Mobile Optimized */}
          <div className="flex items-center gap-3 sm:gap-4">
            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Quantity:</h3>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-base sm:text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 sm:px-5 py-1 sm:py-1.5 w-10 sm:w-12 text-center text-gray-800 font-medium text-sm sm:text-base">{quantity}</span>
              <button
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-base sm:text-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base"
                disabled={!product.inStock}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                onClick={handleMessageButtonClick}
                variant="outline"
                className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                Message Us
              </Button>
            </div>
            
            <Button
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700"
              disabled={!product.inStock}
              onClick={() => {
                if(localStorage.getItem('token') === null) {
                  toast.info('Please login first');
                } else {
                  navigate(`/details/payment/${product._id}?price=${actualPrice}&quantity=${quantity}&name=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.images[0])}`);
                }
              }}
            >
              Buy Now
            </Button>
          </div>

          {/* Features - Mobile Optimized */}
          <div className="space-y-0.5 sm:space-y-1 pt-2 sm:pt-3 text-xs sm:text-sm text-gray-600">
            <p>✓ Free Delivery</p>
            <p>✓ Free 30 Days Return</p>
            <p>{product.inStock ? '✓ In Stock' : '✗ Out of Stock'}</p>
          </div>
        </div>
      </div>

      {/* Product Full Description Section - Mobile Optimized */}
      <section className="my-8 sm:my-10 lg:my-12 bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Product Details</h2>
        <div className="prose max-w-none text-gray-700 whitespace-pre-line text-sm sm:text-base">
          {product.description}
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews productId={product._id} currentUserId={userId || ''} currentUserName={authData?.name || ''} />

      {/* Similar Products Section - Mobile Optimized */}
      {(similarProducts && similarProducts.length > 0) || similarProductsLoading ? (
        <section className="mt-12 sm:mt-14 lg:mt-16">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">You Might Also Like</h2>
          {similarProductsLoading ? (
            <SimilarProductsSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {similarProducts?.map((simProd) => {
                const simActualPrice = simProd.oldPrice && simProd.discount 
                  ? simProd.oldPrice - (simProd.oldPrice * simProd.discount / 100)
                  : simProd.price;
                
                return (
                  <div
                    key={simProd._id}
                    onClick={() => handleProductNavigation(simProd._id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border"
                  >
                    <img
                      src={simProd.images[0] || 'https://via.placeholder.com/300x300.png?text=No+Image'}
                      alt={simProd.name}
                      className="w-full h-32 sm:h-40 lg:h-56 object-contain p-1 sm:p-2"
                      onError={handleImageError}
                    />
                    <div className="p-2 sm:p-3 lg:p-4">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate text-gray-800 mb-1 leading-tight">
                        {simProd.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <p className="text-red-600 font-bold text-sm sm:text-base lg:text-lg">৳{simActualPrice.toLocaleString()}</p>
                          {simProd.oldPrice && simProd.discount && (
                            <span className="text-xs bg-red-100 text-red-700 px-1 sm:px-1.5 py-0.5 rounded">
                              -{simProd.discount}%
                            </span>
                          )}
                        </div>
                        {simProd.stars && (
                          <div className="scale-75 sm:scale-90 lg:scale-100 origin-right">
                            <Rating productId={simProd._id} initialRating={simProd.stars} isSmall />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default ProductDetails;
