import React from 'react';
import { Package, ShoppingCart, Users, PlusCircle, ArrowRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashBoardPreviewProps {
  onNavigateTab?: (tab: string) => void;
}

const DashBoardPreview: React.FC<DashBoardPreviewProps> = ({ onNavigateTab }) => {
  const navigate = useNavigate();

  const handleNav = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-1">Welcome to Exclusive Mart Admin</h2>
        <p className="text-blue-100 text-sm sm:text-base">
          Manage your products, orders, customers, and store operations in one place.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <div 
          onClick={() => handleNav('products')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Inventory
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Products</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View, edit, and delete all catalog items</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-blue-600">
            <span>View catalog</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Add Product */}
        <div 
          onClick={() => handleNav('addproduct')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <PlusCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              New
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Upload product details, images and prices</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-emerald-600">
            <span>Add product</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Orders */}
        <div 
          onClick={() => handleNav('orders')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Sales
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Orders</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Track orders, shipments and status</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-amber-600">
            <span>View orders</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>

        {/* Customers */}
        <div 
          onClick={() => handleNav('customers')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Users
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Customers</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage registered customer accounts</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-purple-600">
            <span>View customers</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900">Want to see the customer-facing store?</h4>
          <p className="text-xs sm:text-sm text-gray-500">Check how your store looks to visitors in real-time.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Store className="h-4 w-4" />
          <span>Open Storefront</span>
        </button>
      </div>
    </div>
  );
};

export default DashBoardPreview;
