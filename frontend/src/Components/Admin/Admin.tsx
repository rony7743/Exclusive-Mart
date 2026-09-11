import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Store, 
  PlusCircle, 
} from 'lucide-react';
import ManageOrder from './ManageOrder';
import ManageProducts from './ManageProducts';
import Customers from './Customars';
import Analytics from './Analytics';
import NotFound from '../error/NotFound';
import DashBoardPreview from './DashBoardPreview';
import Setting from './Setting';
import InsertOne from './InsertOne';

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Default to 'products' as requested, or use URL tab parameter
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'products');

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'addproduct', label: 'Add Product', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashBoardPreview onNavigateTab={handleTabChange} />
          </> 
        );
      case 'products':
        return (
          <>
            <ManageProducts />
          </>
        );

        case 'addproduct': 
        return(
          <>
            <InsertOne />
          </>
        )
        case 'customers':
        return (
          <>
            <Customers />
          </>
        );
      case 'orders':
        return (
          <>
            <ManageOrder />
          </>
        );

        case 'analytics':
        return (
          <>
            <Analytics />
          </>
        );

        case 'settings':
        return (
          <>
            <Setting />
          </>
        );

      default:
        return (
          <>
            <NotFound />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:flex lg:flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1 flex flex-col justify-between overflow-y-auto">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="pt-4 pb-4 border-t border-gray-200 mt-6 space-y-1.5">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
            >
              <Store className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>Visit Store</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        {/* Mobile Header (Hidden on Desktop: all navigation is in the sidebar) */}
        <header className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex-shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                title="Go to storefront"
              >
                <Store className="h-4 w-4" />
                <span>Store</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto w-full">
          <div className="w-full max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;