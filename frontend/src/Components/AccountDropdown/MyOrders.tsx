import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotLogin from '../ui/NotLogin';

interface Product {
  productId?: {
    _id: string;
    name: string;
  };
  quantity?: number;
  price?: number;
  image?: string;
  totalPrice?: number;
}

interface Order {
  _id: string;
  product: Product;
  status: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  console.log('orders', orders);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { authData } = useAuth();
  const userId = authData?.userId;

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && authData?.userId;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      if (!userId || hasFetched) return;
      setIsLoading(true);

      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/getOrders/${userId}`);

        if (Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error('Invalid response format', response.data);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchOrders();
  }, [userId, hasFetched]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/cancelOrder/${orderId}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsLoading(false);
      setShowPopup(false);
      setSelectedOrderId(null);
    }
  };

  const confirmCancel = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowPopup(true);
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated()) {
    return (
      <NotLogin title="Please Login to View Your Orders" subject="Orders" />
    );
  }

  // Loading state for authenticated users
  if (isLoading && !hasFetched) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 text-lg py-10">
              {hasFetched ? "No orders found." : "Unable to load orders."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {orders.map((order) => {
              const product = order.product || {};
              const productName = product.productId?.name || 'Unknown Product';
              const quantity = product.quantity || 0;
              const price = product.price || 0;
              const productId = product.productId?._id || 'Unknown ID';
              const image = product.image || 'https://via.placeholder.com/150';
              const status = order.status || 'unknown';

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/details/${productId}`)}
                  className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row p-3 sm:p-4">
                    <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 flex justify-center">
                      <img
                        src={image}
                        alt={productName}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                        {productName}
                      </h2>
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <p>Quantity: {quantity}</p>
                        <p>Price: ${price.toFixed(2)}</p>
                        <p>Total Price: ${price.toFixed(2)}</p>
                        <div className="flex items-center mt-2">
                          <span className="mr-2">Status:</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'processing'
                                ? 'bg-orange-100 text-orange-800'
                                : status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 sm:px-6">
                    {status !== 'cancelled' && status !== 'delivered' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmCancel(order._id);
                        }}
                        className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Confirm Cancellation
              </h2>
              <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                Are you sure you want to cancel this order?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  No
                </button>
                <button
                  onClick={() => selectedOrderId && handleCancelOrder(selectedOrderId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;