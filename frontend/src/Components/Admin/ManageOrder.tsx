import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner'; 
import { FaUser, FaBox, FaMapMarkerAlt, FaSpinner, FaSearch, FaSyncAlt } from 'react-icons/fa';
import socket, { syncSocketAuthToken } from '../../socket';
import { toast } from 'react-toastify';

interface FormattedOrder {
  _id: string;
  orderStatus: string;
  orderTotalAmount: number;
  orderCreatedAt: string;
  userName?: string;
  userEmail?: string;
  userImgUrl?: string;
  productName?: string;
  productPrice?: number;
  productOldPrice?: number;
  productImages?: string[];
  productDiscount?: number;
  productCategory?: string;
  productInStock?: boolean;
  quantity?: number;
  orderedProductPrice?: number;
  orderedProductImage?: string;
  addressFullName?: string;
  addressStreet?: string;
  addressCity?: string;
  addressDistrict?: string;
  addressThana?: string;
  addressLandmark?: string;
  addressHouse?: string;
  addressPhone?: string;
  addressCountry?: string;
}

// Order status type
type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const ManageOrder: React.FC = () => {
  const [orders, setOrders] = useState<FormattedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status badge styling
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  // Fetch orders from API
  const fetchOrdersAdmin = useCallback(async (page: number, showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/fetchOrders?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.error === false) {
        setOrders(response.data.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        setError(response.data.message || 'Failed to load order data.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdateLoading(orderId);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${import.meta.env.VITE_APP_API_URL}/api/updateOrderStatus/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Instant local state update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(null);
    }
  };

  // Real-time socket & polling setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socket.connected) {
      syncSocketAuthToken(token);
    }

    const handleNewOrder = (data: any) => {
      console.log('Realtime new order received:', data);
      toast.info(`🔔 New order received! (#${data.orderId?.slice(-6)})`);
      // Refetch page 1 silently to include the new order
      fetchOrdersAdmin(1, false);
    };

    const handleStatusUpdated = (data: any) => {
      console.log('Realtime status update received:', data);
      setOrders(prev =>
        prev.map(order =>
          order._id === data.orderId ? { ...order, orderStatus: data.status } : order
        )
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdated);

    // Initial fetch
    fetchOrdersAdmin(currentPage);

    // Auto-polling fallback every 30 seconds
    const interval = setInterval(() => {
      fetchOrdersAdmin(currentPage, false);
    }, 30000);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdated);
      clearInterval(interval);
    };
  }, [currentPage, fetchOrdersAdmin]);

  // Derived filtered orders via useMemo (prevents desync bugs)
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeStatus !== 'all') {
      result = result.filter(order => order.orderStatus?.toLowerCase() === activeStatus.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        order => 
          order._id.toLowerCase().includes(q) ||
          order.userName?.toLowerCase().includes(q) ||
          order.userEmail?.toLowerCase().includes(q) ||
          order.productName?.toLowerCase().includes(q) ||
          order.addressPhone?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeStatus, searchQuery]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  // Loading state on initial load
  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Loading orders..." className="mt-20" />;
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl my-6 max-w-2xl mx-auto text-center">
        <p className="text-red-700 font-medium mb-3">Error: {error}</p>
        <button 
          onClick={() => fetchOrdersAdmin(currentPage)}
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time live order tracking and status management
          </p>
        </div>

        <button
          onClick={() => fetchOrdersAdmin(currentPage, false)}
          disabled={refreshing || loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Refresh orders"
        >
          <FaSyncAlt className={`h-3.5 w-3.5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <div className="pl-4 text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, phone, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-3 outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="pr-4 text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Status filter tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex space-x-2 text-sm font-medium overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => {
            const count = tab.id === 'all' 
              ? orders.length 
              : orders.filter(o => o.orderStatus?.toLowerCase() === tab.id).length;

            return (
              <li key={tab.id} className="flex-shrink-0">
                <button 
                  onClick={() => setActiveStatus(tab.id as OrderStatus)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                    activeStatus === tab.id ? 
                    'bg-blue-600 text-white shadow-sm' : 
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeStatus === tab.id ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Orders count summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
        <span>Showing {filteredOrders.length} of {orders.length} orders on this page</span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live updates active</span>
        </span>
      </div>

      {/* Order list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FaBox className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-700 font-semibold text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery ? 'Try changing your search term.' : 'There are no orders in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusKey = order.orderStatus?.toLowerCase() || 'pending';
            const statusBadgeClass = statusColors[statusKey] || 'bg-gray-100 text-gray-800 border-gray-200';

            return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order header */}
                <div className="bg-gray-50/70 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold uppercase text-gray-500">Order</span>
                    <span className="font-mono text-sm font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                      #{order._id.slice(-8)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${statusBadgeClass}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.orderCreatedAt)}
                    </span>
                  </div>
                </div>
                
                {/* Order details grid */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {order.userImgUrl ? (
                          <img 
                            src={order.userImgUrl} 
                            alt={order.userName || 'User'} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                            <FaUser className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Customer
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {order.userName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.userEmail || 'No email provided'}
                        </p>
                        {order.addressPhone && (
                          <p className="text-xs text-gray-600 mt-1">
                            📞 {order.addressPhone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {order.orderedProductImage ? (
                          <img 
                            src={order.orderedProductImage} 
                            alt={order.productName || 'Product'} 
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-gray-50"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                            <FaBox className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Product
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm truncate" title={order.productName}>
                          {order.productName || 'Product item'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mt-0.5">
                          <span>Qty: <strong>{order.quantity || 1}</strong></span>
                          <span>•</span>
                          <span>Price: <strong>${order.orderedProductPrice?.toLocaleString() || 0}</strong></span>
                        </div>
                        {order.productCategory && (
                          <span className="inline-block mt-1 text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {order.productCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Delivery Address */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
                          <FaMapMarkerAlt className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Delivery Address
                        </h4>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {order.addressFullName || order.userName || 'Recipient'}
                        </p>
                        <div className="text-xs text-gray-600 space-y-0.5 mt-0.5">
                          {[
                            order.addressHouse,
                            order.addressStreet,
                            order.addressThana,
                            order.addressDistrict,
                            order.addressCity
                          ]
                            .filter(Boolean)
                            .join(', ') || 'Address not specified'}
                        </div>
                        {order.addressCountry && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.addressCountry}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Footer & Status Action */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xs font-semibold uppercase text-gray-500">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${order.orderTotalAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    
                    {/* Status update dropdown */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <label htmlFor={`status-${order._id}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                        Update Status:
                      </label>
                      <div className="relative inline-flex items-center">
                        <select 
                          id={`status-${order._id}`}
                          className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                          value={order.orderStatus?.toLowerCase() || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updateLoading === order._id}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updateLoading === order._id && (
                          <FaSpinner className="ml-2 animate-spin text-blue-600 h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center flex-wrap justify-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1 || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ManageOrder;