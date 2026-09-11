import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FaSearch, FaUser, FaEnvelope, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface CustomerItem {
  _id: string;
  name: string;
  email: string;
  imgUrl: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search query by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/fetchUsers`, {
        params: {
          page,
          limit: 20,
          search: search.trim()
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages || 0);
        setTotalUsers(response.data.totalUsers || 0);
        setCurrentPage(response.data.currentPage || page);
      } else if (Array.isArray(response.data)) {
        // Fallback for array response
        setUsers(response.data);
        setTotalUsers(response.data.length);
        setTotalPages(Math.ceil(response.data.length / 20));
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err?.response?.data?.message || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchUsers]);

  const handleMessage = (user: CustomerItem) => {
    const userId = user._id;
    if (userId) {
      navigate(`/messages/viewprofile/${userId}`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View customer details, registration date, and initiate messages
          </p>
        </div>

        <div className="text-xs sm:text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 self-start sm:self-auto shadow-sm">
          Total Customers: <strong className="text-gray-900">{totalUsers}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <div className="pl-4 text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search customers by name or email..."
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

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchUsers(currentPage, debouncedSearch)}
            className="underline font-medium hover:text-red-900 ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && users.length === 0 ? (
        <LoadingSpinner message="Loading customers..." className="mt-20" />
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FaUser className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-800 font-semibold text-lg">No customers found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery ? 'No customers match your search criteria.' : 'There are no registered customers yet.'}
          </p>
        </div>
      ) : (
        /* Customers Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50/70 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user, idx) => {
                  const rowNumber = (currentPage - 1) * 20 + idx + 1;
                  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff`;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-400 font-mono text-xs">
                        {rowNumber}
                      </td>

                      {/* Customer Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.imgUrl || fallbackAvatar}
                            alt={user.name || 'Customer'}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackAvatar;
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              ID: #{user._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-gray-600">
                        <div className="flex items-center space-x-1.5 truncate max-w-xs">
                          <FaEnvelope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-xs">
                          <FaCalendarAlt className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleMessage(user)}
                          className="inline-flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-blue-200 shadow-sm"
                        >
                          <FaComments className="h-3 w-3" />
                          <span>Message</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Showing {users.length > 0 ? (currentPage - 1) * 20 + 1 : 0} to{' '}
              {Math.min(currentPage * 20, totalUsers)} of {totalUsers} customers
            </span>
            <span>20 customers per page</span>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center flex-wrap justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default Customers;