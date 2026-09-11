import React, { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotLogin from '../ui/NotLogin';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  images: string[];
}

const fetchWishList = async (token: string): Promise<Product[]> => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const response = await fetch(`${apiUrl}/api/getwishlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  const data = await response.json();
  return data.products || [];
};

const deleteWishListItem = async ({ productId, token }: { productId: string; token: string }) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const response = await fetch(`${apiUrl}/api/deletewishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete item from wishlist');
  }

  return response.json();
};

const WishList: React.FC = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // React Query for fetching wishlist with proper caching
  const { data: wishList = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['wishlist', token],
    queryFn: () => fetchWishList(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
    retry: 2,
  });

  // Mutation for deleting wishlist items
  const deleteMutation = useMutation({
    mutationFn: deleteWishListItem,
    onSuccess: () => {
      toast.success('Item deleted from wishlist successfully');
      queryClient.invalidateQueries({ queryKey: ['wishlist', token] });
    },
    onError: () => {
      toast.error('Failed to delete item from wishlist');
    },
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
  };

  const handleDelete = (productId: string) => {
    if (!productId || !token) return;
    deleteMutation.mutate({ productId, token });
  };

  // Login interface when token is not available
  if (!token) {
    return (
      <NotLogin title='Please Login to View Your Wishlist' subject='Wishlist'/>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">My Wishlist</h2>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
              <Skeleton height={192} className="rounded-md" />
              <div className="mt-3">
                <Skeleton height={20} className="mb-2" />
                <Skeleton height={16} width="60%" className="mb-2" />
                <Skeleton height={16} width="80%" className="mb-2" />
                <Skeleton height={16} width="40%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['wishlist', token] })}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty Wishlist State */}
      {!isLoading && !error && wishList.length === 0 && (
        <div className="text-center py-16 sm:py-24">
          <div className="mx-auto flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800">
            Your wishlist is empty
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Discover amazing products and add them to your wishlist for future purchases.
          </p>
          <div className="mt-8">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/')}
              className="text-sm sm:text-base px-6 py-2"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {!isLoading && !error && wishList.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {wishList.length} item{wishList.length > 1 ? 's' : ''} in your wishlist
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishList.map((item: Product) => (
              <div
                key={item._id}
                className="hover:border-blue-500 border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/details/${item._id}`)}
              >
                {/* Image Section */}
                <div className="relative w-full h-48 sm:h-56 mb-3 flex-shrink-0">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-contain rounded-md"
                    onError={handleImageError}
                  />
                </div>
                
                {/* Content Section - Flexible */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  
                  <div className="space-y-1 mb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">${item.price}</span>
                      {item.oldPrice > item.price && (
                        <span className="line-through text-gray-400 text-sm">${item.oldPrice}</span>
                      )}
                    </div>
                    {item.discount > 0 && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {item.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Button Section - Fixed at bottom */}
                  <div className="mt-auto">
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id);
                        }}
                        className="text-red-500 border-red-500 hover:bg-red-50 text-xs sm:text-sm flex-1 min-h-[40px]"
                        size="small"
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/details/${item._id}`);
                        }}
                        variant="contained"
                        color="primary"
                        startIcon={<RemoveShoppingCartIcon />}
                        className="text-xs sm:text-sm flex-1 min-h-[40px]"
                        size="small"
                      >
                        Buy Now
                      </Button>
                    </Stack>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishList;