import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import { CiMobile4 } from "react-icons/ci";
import { MdLaptopMac, MdWatch, MdHeadphones, MdKitchen } from "react-icons/md";
import { GiClothes, GiLipstick, GiPerfumeBottle, GiBookshelf } from "react-icons/gi";

interface Category {
  icon: React.ReactNode;
  name: string;
  searchTerm: string; // For search functionality
}

const categories: Category[] = [
  { 
    icon: <CiMobile4 className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Phones',
    searchTerm: 'mobile phone smartphone'
  },
  { 
    icon: <MdLaptopMac className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Laptops',
    searchTerm: 'laptop computer notebook'
  },
  { 
    icon: <MdWatch className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Watches',
    searchTerm: 'watch smartwatch timepiece'
  },
  { 
    icon: <MdHeadphones className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Headphones',
    searchTerm: 'headphone earphone audio'
  },
  { 
    icon: <GiClothes className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Clothing',
    searchTerm: 'clothes clothing fashion apparel'
  },
  { 
    icon: <GiLipstick className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Cosmetics',
    searchTerm: 'cosmetics makeup beauty'
  },
  { 
    icon: <GiPerfumeBottle className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Perfumes',
    searchTerm: 'perfume fragrance scent'
  },
  { 
    icon: <MdKitchen className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Kitchen',
    searchTerm: 'kitchen appliance cookware'
  },
  { 
    icon: <GiBookshelf className='h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' />, 
    name: 'Books',
    searchTerm: 'book literature reading'
  },
];

const BrowseCategory: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 120 : 200; // Smaller scroll on mobile
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (category: Category) => {
    // Navigate to search page or products page with category filter
    navigate(`/search?q=${encodeURIComponent(category.searchTerm)}&category=${encodeURIComponent(category.name)}`);
    
    // Alternative: Navigate to a category-specific page
    // navigate(`/category/${category.name.toLowerCase()}`);
  };

  return (
    <div className='px-2 sm:px-4 md:px-8 lg:px-16 xl:px-20 py-6 sm:py-8 md:py-10'>
      {/* Divider - Responsive */}
      <div className='h-0.5 w-full mb-6 sm:mb-8 md:mb-10 bg-black'></div>

      {/* Header Section - More Responsive */}
      <div className='flex justify-between items-start sm:items-center mb-4 sm:mb-6'>
        <div className='flex-1'>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="h-5 sm:h-6 md:h-7 w-2 sm:w-2.5 md:w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold text-sm sm:text-base">Categories</div>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mt-2 sm:mt-4">Browse By Category</h1>
        </div>
        
        {/* Navigation Arrows - Mobile Optimized */}
        <div className='flex space-x-2 sm:space-x-3 text-lg sm:text-xl'>
          <button 
            onClick={() => scroll('left')} 
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Scroll left"
          >
            <GoArrowLeft size={16} className="sm:hidden" />
            <GoArrowLeft size={20} className="hidden sm:block md:hidden" />
            <GoArrowLeft size={24} className="hidden md:block" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="p-1.5 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Scroll right"
          >
            <GoArrowRight size={16} className="sm:hidden" />
            <GoArrowRight size={20} className="hidden sm:block md:hidden" />
            <GoArrowRight size={24} className="hidden md:block" />
          </button>
        </div>
      </div>

      {/* Categories Grid - Highly Responsive */}
      <div 
        ref={scrollRef} 
        className="flex overflow-x-auto space-x-3 sm:space-x-4 md:space-x-6 scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat, index) => (
          <div 
            key={index} 
            onClick={() => handleCategoryClick(cat)}
            className='flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 border rounded-lg sm:rounded-xl flex flex-col justify-center items-center hover:shadow-lg hover:border-red-300 hover:bg-red-50 transition-all duration-300 cursor-pointer group active:scale-95'
          >
            <div className="text-gray-700 group-hover:text-red-600 transition-colors duration-300">
              {cat.icon}
            </div>
            <p className='mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-medium text-center px-1 leading-tight group-hover:text-red-600 transition-colors duration-300'>
              {cat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile Helper Text */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          Tap a category to explore products
        </p>
      </div>
    </div>
  );
};

export default BrowseCategory;