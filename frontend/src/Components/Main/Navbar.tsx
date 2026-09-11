import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAccountCircle, MdSearch, MdMenu, MdClose } from "react-icons/md";
import { HiOutlineChatBubbleLeftRight, HiOutlineShoppingBag } from "react-icons/hi2";
import { FiUser, FiPackage, FiHeart, FiCreditCard, FiRotateCcw, FiGift, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { useAuth } from '../auth/AuthContext';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import socket, { syncSocketAuthToken } from '../../socket';
import { toast } from 'react-toastify';

interface ConversationType {
  id: string;
  name: string;
  user: {
    name: string;
    email: string;
    imgUrl: string;
    role: 'admin' | 'user';
    userId: string;
  };
}

const baseMenuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;

// Enhanced Styled Autocomplete
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    padding: '6px 10px',
    fontSize: '0.875rem',
    background: '#ffffff',
    transition: 'all 0.3s ease',
    minHeight: '40px',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.8rem',
      padding: '4px 8px',
      borderRadius: '10px',
      minHeight: '36px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      padding: '3px 6px',
      borderRadius: '8px',
      minHeight: '32px',
    },
    '&:hover': {
      borderColor: '#3b82f6',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
    },
    '&.Mui-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
      background: '#ffffff',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.8rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
    },
    '&.Mui-focused': {
      color: '#3b82f6',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const Navbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const token = localStorage.getItem('token');
  const menuItems = token ? baseMenuItems.filter(item => item !== 'Sign Up') : baseMenuItems;

  const navigate = useNavigate();
  const { authData, logout } = useAuth();

  const searchSuggestions = [
    { title: 'iPhone 15 Pro Max', category: 'Electronics' },
    { title: 'Samsung Galaxy S24', category: 'Electronics' },
    { title: 'MacBook Air M3', category: 'Laptops' },
    { title: 'Nike Air Force 1', category: 'Shoes' },
    { title: 'Adidas Ultraboost', category: 'Shoes' },
    { title: 'Cotton T-Shirt', category: 'Clothing' },
    { title: 'Wireless Headphones', category: 'Electronics' },
    { title: 'Gaming Chair', category: 'Furniture' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1024);
    if (width >= 1024) {
      setSidebarOpen(false);
      setMobileSearchOpen(false);
    }
    if (width >= 640) {
      setMobileSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
  }, [sidebarOpen]);

  const handleLogout = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setAvatarOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    if (isMobile || isTablet) setSidebarOpen((prev) => !prev);
  }, [isMobile, isTablet]);

  const handleMenuSelect = useCallback((item: string) => {
    setActiveMenu(item);
    if (isMobile || isTablet) setSidebarOpen(false);
    const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '')}`;
    navigate(path);
  }, [isMobile, isTablet, navigate]);

  const toggleAvatar = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAvatarOpen((prev) => !prev);
  }, []);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const avatarMenu = document.getElementById("avatar-menu");
    if (avatarMenu && !avatarMenu.contains(target)) {
      setAvatarOpen(false);
    }
  }, []);

  const handleDropdownItemClick = useCallback((path: string, e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    setAvatarOpen(false);
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [handleOutsideClick]);

  const handleFirstChatLoaded = useCallback((conversation: ConversationType | null) => {
    if (conversation) {
      navigate(`/messages/${conversation.id}`, {
        state: { user: conversation.user, name: conversation.name },
      });
    } else {
      toast.info('No active conversation found');
    }
  }, [navigate]);

  useEffect(() => {
    socket.on('first_chat_loaded', handleFirstChatLoaded);
    return () => {
      socket.off('first_chat_loaded', handleFirstChatLoaded);
    };
  }, [handleFirstChatLoaded]);

  const handleChatClick = useCallback(() => {
    if (!token) {
      toast.info('Please login to access messages');
      return;
    }
    syncSocketAuthToken(token);
    socket.emit('load_first_chat');
  }, [token]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setMobileSearchOpen(false);
  }, [navigate, searchQuery]);

  const toggleMobileSearch = useCallback(() => {
    setMobileSearchOpen((prev) => !prev);
  }, []);

  return (
    <div className="font-inter">
      {/* Sticky Navbar with Glass Effect */}
      <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/92 backdrop-blur-md shadow-md border-b border-gray-100' 
          : 'bg-white/95 shadow-sm border-b border-gray-100'
      }`}>
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-20 h-14 sm:h-16 flex justify-between items-center gap-2">
          {/* Logo/Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile/Tablet Menu Button */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <MdClose className="text-xl text-gray-700" />
              ) : (
                <MdMenu className="text-xl text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <button
              type="button"
              className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              onClick={() => navigate('/')}
            >
              Exclusive
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex">
            <ul className="flex text-sm md:text-sm lg:text-base text-gray-600 space-x-3 md:space-x-4 lg:space-x-5">
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => handleMenuSelect(item)}
                    className={`relative py-1 px-2 transition-all duration-200 hover:text-blue-600 group ${
                      activeMenu === item ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {item}
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-200 ${
                      activeMenu === item ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-50 group-hover:scale-100'
                    }`} />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Desktop Search Bar */}
            <div className="hidden md:block">
              <Stack spacing={2} sx={{ 
                width: { 
                  md: 180, 
                  lg: 220, 
                  xl: 250 
                } 
              }}>
                <StyledAutocomplete
                  freeSolo
                  disableClearable
                  options={searchSuggestions.map((option) => option.title)}
                  inputValue={searchQuery}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason !== 'reset') {
                      setSearchQuery(newInputValue);
                    }
                  }}
                  onChange={(_, value) => {
                    const searchValue = typeof value === 'string' ? value : '';
                    setSearchQuery(searchValue);
                    if (searchValue) {
                      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search products..."
                      size="small"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <button
                            onClick={handleSearch}
                            className="p-1 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MdSearch className="text-base md:text-lg text-blue-600" />
                          </button>
                        ),
                      }}
                    />
                  )}
                />
              </Stack>
            </div>

            {/* Tablet Search Bar */}
            <div className="hidden sm:block md:hidden">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-32 sm:w-40 px-3 py-2 pl-8 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
                <MdSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <button
                  onClick={handleSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Go
                </button>
              </div>
            </div>

            {/* Mobile Search Button */}
            <button 
              className="sm:hidden p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={toggleMobileSearch}
            >
              <MdSearch className="text-lg text-gray-600" />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
              {/* Messages */}
              <button 
                type="button" 
                onClick={handleChatClick} 
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
                title="Messages"
              >
                <HiOutlineChatBubbleLeftRight className="text-[18px] sm:text-[20px] text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Cart */}
              <button 
                type="button" 
                onClick={() => navigate('/wishlist')} 
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
                title="Shopping Cart"
              >
                <HiOutlineShoppingBag className="text-[18px] sm:text-[20px] text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" id="avatar-menu">
              <button 
                type="button" 
                onClick={toggleAvatar}
                className="focus:outline-none hover:scale-105 transition-transform duration-200"
                aria-label="User menu"
              >
                {authData?.imgUrl ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-sm">
                    <img 
                      src={authData.imgUrl} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <MdAccountCircle className="text-2xl sm:text-3xl md:text-4xl cursor-pointer text-gray-400 hover:text-blue-600 transition-colors" />
                )}
              </button>
              
              {/* Enhanced Dropdown Menu */}
              {avatarOpen && (
                <div className="absolute top-10 sm:top-11 md:top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl w-56 sm:w-60 z-50 overflow-hidden">
                  {/* User Info Header */}
                  {authData && (
                    <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                      <p className="font-semibold text-xs sm:text-sm md:text-base text-gray-800 truncate">{authData.name || 'User'}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{authData.email}</p>
                    </div>
                  )}
                  
                  {/* Menu Items */}
                  <div className="py-1 sm:py-2">
                    {[
                      { label: 'Manage My Account', path: '/account', icon: <FiUser /> },
                      { label: 'My Orders', path: '/orders', icon: <FiPackage /> },
                      { label: 'My Wishlist', path: '/wishlist', icon: <FiHeart /> },
                      { label: 'Payment Methods', path: '/payment-methods', icon: <FiCreditCard /> },
                      { label: 'Order Returns & Refunds', path: '/returns', icon: <FiRotateCcw /> },
                      { label: 'Refer a Friend', path: '/refer', icon: <FiGift /> },
                      { label: 'Help / Support Center', path: '/support', icon: <FiHelpCircle /> },
                    ].map((item, index) => (
                      <li 
                        key={index}
                        className="px-3 sm:px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2.5 text-gray-700 hover:text-blue-600" 
                        onClick={(e) => handleDropdownItemClick(item.path, e)}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                      </li>
                    ))}
                    
                    {/* Logout */}
                    <li 
                      className="px-3 sm:px-4 py-2.5 hover:bg-red-50 text-red-600 cursor-pointer transition-colors flex items-center space-x-2.5 border-t border-gray-100 mt-1"
                      onClick={handleLogout}
                    >
                      <span className="text-sm"><FiLogOut /></span>
                      <span className="text-xs sm:text-sm font-medium">Logout</span>
                    </li>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white px-3 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full px-3 py-2 pl-9 pr-16 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
              />
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Go
                </button>
                <button
                  onClick={toggleMobileSearch}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <MdClose className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Enhanced Mobile Sidebar */}
      <nav
        className={`fixed top-0 left-0 w-72 sm:w-80 h-full bg-white z-50 transition-transform duration-300 ease-in-out transform shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
        aria-hidden={!sidebarOpen}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Menu</h2>
            <button
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MdClose className="text-xl sm:text-2xl" />
            </button>
          </div>
          {authData && (
            <div className="mt-3 sm:mt-4 flex items-center space-x-2 sm:space-x-3">
              {authData.imgUrl ? (
                <img 
                  src={authData.imgUrl} 
                  alt="User" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/30"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MdAccountCircle className="text-xl sm:text-2xl" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm sm:text-base">{authData.name || 'User'}</p>
                <p className="text-xs sm:text-sm opacity-80">{authData.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search in Sidebar */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  setSidebarOpen(false);
                }
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-sm"
            />
            <MdSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
            <button
              onClick={() => {
                handleSearch();
                setSidebarOpen(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-col p-3 sm:p-4 space-y-1 sm:space-y-2">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={`w-full text-left p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base ${
                  activeMenu === item 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-700'
                }`}
                onClick={() => handleMenuSelect(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs sm:text-sm text-gray-600 text-center">
            © 2024 Exclusive. All rights reserved.
          </p>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
