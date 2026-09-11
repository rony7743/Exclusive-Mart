import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiSearch, FiX, FiChevronRight, FiExternalLink, FiChevronLeft } from 'react-icons/fi';

const images = ['/figma/xa (2).jpg', '/figma/xa (3).jpg'];

// Enhanced structured and searchable categories
const categoryData = {
  fashion: {
    label: 'Fashion & Clothing',
    icon: '👗',
    subcategories: {
      women: {
        label: "Women's Fashion",
        items: [
          { id: 'saree', label: 'Sarees & Traditional Wear', searchTags: ['saree', 'traditional', 'ethnic'] },
          { id: 'western-women', label: 'Western Outfits', searchTags: ['western', 'dress', 'top', 'jeans'] },
          { id: 'hijab', label: 'Hijab & Modest Wear', searchTags: ['hijab', 'islamic', 'modest', 'abaya'] },
          { id: 'accessories-women', label: 'Jewelry & Accessories', searchTags: ['jewelry', 'accessories', 'bags', 'shoes'] }
        ]
      },
      men: {
        label: "Men's Fashion",
        items: [
          { id: 'punjabi', label: 'Punjabi & Kurta', searchTags: ['punjabi', 'kurta', 'traditional', 'ethnic'] },
          { id: 'shirt-pant', label: 'Shirts & Pants', searchTags: ['shirt', 'pant', 'formal', 'office'] },
          { id: 'casual-men', label: 'Casual Wear', searchTags: ['casual', 't-shirt', 'polo', 'shorts'] },
          { id: 'accessories-men', label: 'Accessories & Watches', searchTags: ['watch', 'belt', 'wallet', 'accessories'] }
        ]
      }
    }
  },
  electronics: {
    label: 'Electronics',
    icon: '📱',
    subcategories: {
      mobile: {
        label: 'Mobile & Tablets',
        items: [
          { id: 'smartphones', label: 'Smartphones', searchTags: ['phone', 'mobile', 'android', 'iphone'] },
          { id: 'tablets', label: 'Tablets', searchTags: ['tablet', 'ipad', 'android-tablet'] },
          { id: 'accessories-mobile', label: 'Mobile Accessories', searchTags: ['case', 'charger', 'headphones', 'screen-protector'] }
        ]
      },
      computers: {
        label: 'Computers & Laptops',
        items: [
          { id: 'laptops', label: 'Laptops', searchTags: ['laptop', 'notebook', 'gaming-laptop'] },
          { id: 'desktops', label: 'Desktop Computers', searchTags: ['desktop', 'pc', 'gaming-pc'] },
          { id: 'accessories-computer', label: 'Computer Accessories', searchTags: ['keyboard', 'mouse', 'monitor', 'speaker'] }
        ]
      }
    }
  },
  home: {
    label: 'Home & Lifestyle',
    icon: '🏠',
    subcategories: {
      furniture: {
        label: 'Furniture',
        items: [
          { id: 'bedroom', label: 'Bedroom Furniture', searchTags: ['bed', 'mattress', 'wardrobe', 'dresser'] },
          { id: 'living-room', label: 'Living Room', searchTags: ['sofa', 'chair', 'table', 'tv-stand'] },
          { id: 'kitchen-furniture', label: 'Kitchen & Dining', searchTags: ['dining-table', 'kitchen-cabinet', 'bar-stool'] }
        ]
      },
      appliances: {
        label: 'Home Appliances',
        items: [
          { id: 'kitchen-appliances', label: 'Kitchen Appliances', searchTags: ['refrigerator', 'microwave', 'blender', 'rice-cooker'] },
          { id: 'cleaning', label: 'Cleaning Appliances', searchTags: ['vacuum', 'washing-machine', 'iron'] }
        ]
      }
    }
  },
  health: {
    label: 'Health & Beauty',
    icon: '💄',
    subcategories: {
      skincare: {
        label: 'Skincare',
        items: [
          { id: 'face-care', label: 'Face Care', searchTags: ['face-wash', 'moisturizer', 'serum', 'sunscreen'] },
          { id: 'body-care', label: 'Body Care', searchTags: ['body-lotion', 'soap', 'shower-gel'] }
        ]
      },
      makeup: {
        label: 'Makeup',
        items: [
          { id: 'face-makeup', label: 'Face Makeup', searchTags: ['foundation', 'concealer', 'powder', 'blush'] },
          { id: 'eye-makeup', label: 'Eye Makeup', searchTags: ['eyeshadow', 'mascara', 'eyeliner', 'eyebrow'] }
        ]
      }
    }
  },
  sports: {
    label: 'Sports & Outdoor',
    icon: '⚽',
    subcategories: {
      fitness: {
        label: 'Fitness Equipment',
        items: [
          { id: 'gym-equipment', label: 'Gym Equipment', searchTags: ['dumbbell', 'treadmill', 'exercise-bike'] },
          { id: 'yoga', label: 'Yoga & Meditation', searchTags: ['yoga-mat', 'meditation', 'pilates'] }
        ]
      },
      outdoor: {
        label: 'Outdoor Sports',
        items: [
          { id: 'cricket', label: 'Cricket', searchTags: ['cricket-bat', 'ball', 'helmet', 'pads'] },
          { id: 'football', label: 'Football', searchTags: ['football', 'soccer', 'boots', 'jersey'] }
        ]
      }
    }
  }
};

const Body: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState(categoryData);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Search functionality with navigation
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredCategories(categoryData);
      return;
    }

    const filtered = Object.entries(categoryData).reduce((acc, [key, category]) => {
      const matchingSubcategories = Object.entries(category.subcategories).reduce((subAcc, [subKey, subcategory]) => {
        const matchingItems = subcategory.items.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.searchTags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        if (matchingItems.length > 0) {
          subAcc[subKey] = { ...subcategory, items: matchingItems };
        }
        return subAcc;
      }, {} as any);

      if (Object.keys(matchingSubcategories).length > 0) {
        acc[key] = { ...category, subcategories: matchingSubcategories };
      }
      return acc;
    }, {} as any);

    setFilteredCategories(filtered);
  }, []);

  // Navigate to search page with only keyword
  const navigateToSearch = useCallback((query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [navigate]);

  // Handle Enter key press in search
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigateToSearch(searchQuery);
    }
  }, [searchQuery, navigateToSearch]);

  const toggleMenu = useCallback((menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
    setOpenSubMenu(null);
  }, []);

  const toggleSubMenu = useCallback((subMenuName: string) => {
    setOpenSubMenu((prev) => (prev === subMenuName ? null : subMenuName));
  }, []);

  // Handle category selection with search navigation (only keyword)
  const handleCategorySelect = useCallback((categoryId: string, categoryLabel: string) => {
    setSelectedCategory(categoryId);
    navigate(`/search?q=${encodeURIComponent(categoryLabel)}`);
  }, [navigate]);

  // Handle main category click (only keyword)
  const handleMainCategoryClick = useCallback((categoryLabel: string) => {
    navigate(`/search?q=${encodeURIComponent(categoryLabel)}`);
  }, [navigate]);

  // Handle subcategory click (only keyword)
  const handleSubCategoryClick = useCallback((subcategoryLabel: string) => {
    navigate(`/search?q=${encodeURIComponent(subcategoryLabel)}`);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredCategories(categoryData);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Skeleton Components
  const SearchBarSkeleton = () => (
    <div className="relative mb-4 sm:mb-6">
      <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
        <Skeleton circle width={20} height={20} className="mr-2 sm:mr-3" />
        <Skeleton height={20} className="flex-1" />
        <Skeleton width={60} height={28} className="rounded ml-2" />
      </div>
    </div>
  );

  const CategoryItemSkeleton = ({ hasSubcategories = false }) => (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-1 sm:mb-2">
      <div className="flex items-center justify-between w-full p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <Skeleton circle width={32} height={32} className="flex-shrink-0" />
          <Skeleton height={16} width="70%" />
        </div>
        <Skeleton circle width={20} height={20} />
      </div>
      
      {hasSubcategories && (
        <div className="ml-4 sm:ml-6 pb-3 sm:pb-4 space-y-1 sm:space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border-l-2 border-gray-100 pl-3 sm:pl-4">
              <div className="flex items-center justify-between w-full p-2 sm:p-3">
                <Skeleton height={14} width="60%" />
                <Skeleton circle width={16} height={16} />
              </div>
              <div className="ml-2 sm:ml-4 mt-1 sm:mt-2 space-y-1">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} height={12} width="80%" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SidebarSkeleton = () => (
    <div className="space-y-1 sm:space-y-2">
      <SearchBarSkeleton />
      
      <div className="space-y-1 sm:space-y-2 max-h-[60vh] lg:max-h-none">
        {[...Array(6)].map((_, i) => (
          <CategoryItemSkeleton 
            key={i} 
            hasSubcategories={i < 3} // First 3 items have subcategories in skeleton
          />
        ))}
      </div>
    </div>
  );

  const ImageSliderSkeleton = () => (
    <div className="relative w-full h-[220px] sm:h-[260px] md:h-[310px] lg:h-[340px] overflow-hidden rounded-xl sm:rounded-2xl">
      <Skeleton height="100%" className="absolute inset-0" />
      
      {/* Skeleton for indicators */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-30">
        {[...Array(2)].map((_, index) => (
          <Skeleton
            key={index}
            circle
            width={12}
            height={12}
            className="sm:w-3 sm:h-3"
          />
        ))}
      </div>

      {/* Skeleton for navigation arrows */}
      <Skeleton
        circle
        width={32}
        height={32}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 sm:w-10 sm:h-10"
      />
      <Skeleton
        circle
        width={32}
        height={32}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 sm:w-10 sm:h-10"
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="px-3 sm:px-5 md:px-6 lg:px-8 xl:px-16 font-inter">
        <div className="flex flex-col lg:flex-row w-full mt-3 sm:mt-4 lg:mt-5 gap-3">
          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-[340px] lg:flex-shrink-0 order-2 lg:order-1 p-2 sm:p-3" aria-label="Categories">
            <SidebarSkeleton />
          </aside>

          {/* Image Slider Skeleton */}
          <div className="w-full flex-1 order-1 lg:order-2">
            <ImageSliderSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 md:px-6 lg:px-8 xl:px-16 font-inter">
      <div className="flex flex-col lg:flex-row w-full mt-3 sm:mt-4 lg:mt-5 gap-3">
        {/* Enhanced Sidebar Categories */}
        <aside className="w-full lg:w-[340px] lg:flex-shrink-0 order-2 lg:order-1 p-2 sm:p-3" aria-label="Categories">
          {/* Enhanced Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <div className="flex items-center bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm hover:border-blue-300 focus-within:border-blue-500 focus-within:shadow-md transition-all duration-200">
              <FiSearch className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 font-medium min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 ml-1 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  title="Clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => navigateToSearch(searchQuery)}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                disabled={!searchQuery.trim()}
                title="Search"
              >
                {isMobile ? 'Go' : 'Search'}
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-1 sm:space-y-2 max-h-[60vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
            {Object.entries(filteredCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-2.5 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                  onClick={() => toggleMenu(categoryKey)}
                  onDoubleClick={() => handleMainCategoryClick(categoryKey)}
                  aria-expanded={openMenu === categoryKey}
                  title={`Click to expand, double-click to search ${category.label}`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <span className="text-lg sm:text-xl group-hover:scale-105 transition-transform duration-200 flex-shrink-0">{category.icon}</span>
                    <span className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors truncate">{category.label}</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainCategoryClick(categoryKey);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMainCategoryClick(categoryKey);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Search this category"
                    >
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </span>
                    <FiChevronRight 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        openMenu === categoryKey ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {openMenu === categoryKey && (
                  <div className="ml-4 sm:ml-6 pb-3 sm:pb-4 space-y-1 sm:space-y-2">
                    {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                      <div key={subKey} className="border-l-2 border-gray-100 pl-3 sm:pl-4">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
                          onClick={() => toggleSubMenu(`${categoryKey}-${subKey}`)}
                          onDoubleClick={() => handleSubCategoryClick(categoryKey)}
                          title={`Click to expand, double-click to search ${subcategory.label}`}
                        >
                          <span className="font-medium text-xs sm:text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">{subcategory.label}</span>
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubCategoryClick(categoryKey);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSubCategoryClick(categoryKey);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              title="Search this subcategory"
                            >
                              <FiExternalLink className="w-3 h-3" />
                            </span>
                            <FiChevronRight 
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                                openSubMenu === `${categoryKey}-${subKey}` ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </button>
                        
                        {openSubMenu === `${categoryKey}-${subKey}` && (
                          <ul className="ml-2 sm:ml-4 mt-1 sm:mt-2 space-y-1">
                            {subcategory.items.map((item) => (
                              <li key={item.id}>
                                <button
                                  type="button"
                                  className={`w-full text-left p-2 text-xs sm:text-sm rounded-lg transition-all duration-200 group hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 ${
                                    selectedCategory === item.id
                                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold border border-blue-200'
                                      : 'text-gray-600 hover:text-gray-800 border border-transparent'
                                  }`}
                                  onClick={() => handleCategorySelect(item.id, item.label)}
                                  title={`Search for ${item.label}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="group-hover:font-medium transition-all truncate pr-2">{item.label}</span>
                                    <FiExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity flex-shrink-0" />
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No results message */}
          {searchQuery && Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5-1.709M15 1H9v6h6V1z" />
              </svg>
              <p className="font-medium mb-2 text-sm sm:text-base">No categories found for "{searchQuery}"</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:underline"
                >
                  Clear search
                </button>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <button
                  onClick={() => navigateToSearch(searchQuery)}
                  className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium hover:underline"
                >
                  Search products instead
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Enhanced Image Slider */}
        <div className="w-full flex-1 order-1 lg:order-2">
          <div className="relative w-full h-[220px] sm:h-[260px] md:h-[310px] lg:h-[340px] overflow-hidden rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            {images.map((img, index) => (
              <img
                key={img}
                src={img}
                alt={`Slide ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  currentIndex === index ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20"></div>
            
            {/* Slider indicators */}
            <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-30">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    currentIndex === index 
                      ? 'bg-white shadow-lg ring-2 ring-white/50' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/25 hover:bg-white/45 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-30"
              aria-label="Previous slide"
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/25 hover:bg-white/45 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-30"
              aria-label="Next slide"
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Selected Category Display */}
      {selectedCategory && (
        <div className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <p className="text-blue-800 font-semibold text-sm sm:text-base">
                🎯 Selected Category: <span className="text-blue-600">{selectedCategory}</span>
              </p>
              <p className="text-blue-600 text-xs sm:text-sm mt-1">Click any category to search for products</p>
            </div>
            <button
              onClick={() => setSelectedCategory('')}
              className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-100 rounded-full transition-colors self-start sm:self-auto"
              title="Clear selection"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Body;
