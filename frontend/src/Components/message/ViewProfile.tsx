import axios from 'axios';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface User {
  name: string;
  email: string;
  role: string;
  imgUrl: string;
}

interface Address {
  fullName: string;
  street: string;
  house: string;
  thana: string;
  district: string;
  city: string;
  phone: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
}

interface Order {
  status: string;
  totalAmount: number;
  product: {
    productId: Product;
    price: number;
    quantity: number;
  };
}

interface Review {
  productId: string;
  rating: number;
  review: string;
  likes: number;
}

interface UserProfileData {
  user: User;
  address: Address;
  orders: Order[];
  reviews: Review[];
}

const fetchUserProfile = async (userId: string): Promise<UserProfileData> => {
  const apiUrl = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('API base URL is not configured');
  }
  const response = await axios.get(`${apiUrl}/api/userProfile/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

const ViewProfile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Profile</div>
          <p className="text-gray-600">Something went wrong. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">👤</div>
          <p>No profile data found</p>
        </div>
      </div>
    );
  }

  const { user, address, orders, reviews } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">User Profile</h1>
          
          {user && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={user.imgUrl}
                  alt="User Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-gray-100"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Address Section */}
          {address && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  Address
                </h2>
                <div className="space-y-2 text-sm sm:text-base">
                  <p className="font-medium text-gray-900">{address.fullName}</p>
                  <p className="text-gray-600">{address.street}, {address.house}</p>
                  <p className="text-gray-600">{address.thana}, {address.district}</p>
                  <p className="text-gray-600">{address.city}</p>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{address.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders and Reviews Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Orders */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🛒</span>
                Orders ({orders.length})
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: Order, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => navigate(`/details/${order.product.productId._id}`)}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-green-600">${order.totalAmount}</p>
                      </div>
                      
                      {order.product && order.product.productId && (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={order.product.productId.images[0]}
                              alt="Product"
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                              {order.product.productId.name}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="text-gray-500">Price:</span> ${order.product.price}
                              </div>
                              <div>
                                <span className="text-gray-500">Qty:</span> {order.product.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⭐</span>
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-500">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: Review, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">({review.rating}/5)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <span>👍</span>
                          <span>{review.likes}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-2 leading-relaxed">{review.review}</p>
                      <p className="text-xs text-gray-500">Product ID: {review.productId}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
