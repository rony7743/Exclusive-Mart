import React from 'react';
import { FaBabyCarriage, FaRegClock, FaShieldAlt } from 'react-icons/fa';

const Feature : React.FC = () => {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 mt-10 md:mt-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center space-x-4">
            <div className="h-7 w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold">Our Products</div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-4">Explore Our Products</h1>
        </div>
        {/* Navigation buttons can be uncommented if needed */}
        {/* <div className="flex space-x-3 text-xl mt-4 sm:mt-0">
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <span>←</span>
          </button>
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <span>→</span>
          </button>
        </div> */}
      </div>

      {/* Featured Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Main Feature (Full width on mobile, Half width on large screens) */}
        <div className="bg-black text-white rounded-lg overflow-hidden h-64 sm:h-80 md:h-96 lg:h-full">
          <div className="flex flex-col sm:flex-row h-full">
            <div className="w-full sm:w-1/2 p-4 sm:p-6 md:p-8 flex items-center justify-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">PlayStation 5</h2>
                <p className="text-sm md:text-base lg:text-lg">Black and White version of the PS5 coming out on sale.</p>
                <button className="text-black mt-3 md:mt-5 rounded-lg bg-green-400 px-4 py-1 md:px-5 md:py-2 text-sm md:text-base">Shop Now</button>
              </div>
            </div>
            <div className="w-full sm:w-1/2 h-40 sm:h-auto">
              <img src="/figma/fr1.svg" alt="PlayStation 5" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Column - Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Top Feature */}
          <div className="col-span-1 sm:col-span-2 bg-black text-white rounded-lg overflow-hidden h-64 sm:h-80">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 p-4 sm:p-6 flex items-center justify-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">Accessories</h2>
                  <p className="text-sm md:text-base">Latest gaming accessories for serious gamers.</p>
                  <button className="text-black mt-3 rounded-lg bg-green-400 px-4 py-1 text-sm">Shop Now</button>
                </div>
              </div>
              <div className="w-full sm:w-1/2 h-32 sm:h-auto">
                <img src="/figma/fr2.svg" alt="Gaming Accessories" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Bottom Left Feature */}
          <div className="bg-black text-white rounded-lg overflow-hidden h-64">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 p-4 flex items-center justify-center">
                <div>
                  <h2 className="text-lg md:text-xl font-bold mb-2">Controllers</h2>
                  <p className="text-xs md:text-sm">Next-gen gaming controllers.</p>
                  <button className="text-black mt-2 rounded-lg bg-green-400 px-3 py-1 text-xs">Shop Now</button>
                </div>
              </div>
              <div className="w-full sm:w-1/2 h-32 sm:h-auto">
                <img src="/figma/fr3.svg" alt="Controllers" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/* Bottom Right Feature */}
          <div className="bg-black text-white rounded-lg overflow-hidden h-64">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 p-4 flex items-center justify-center">
                <div>
                  <h2 className="text-lg md:text-xl font-bold mb-2">Headsets</h2>
                  <p className="text-xs md:text-sm">Immersive gaming experience.</p>
                  <button className="text-black mt-2 rounded-lg bg-green-400 px-3 py-1 text-xs">Shop Now</button>
                </div>
              </div>
              <div className="w-full sm:w-1/2 h-32 sm:h-auto">
                <img src="/figma/fr4.svg" alt="Headsets" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-around items-center gap-10 mt-10">
        <div className="flex flex-col space-y-4 items-center text-center">
          <FaBabyCarriage className="text-[4rem] md:text-[5rem] border rounded-full p-3 text-indigo-500" />
          <h1 className="text-xl md:text-2xl font-semibold">Free And Fast Delivery</h1>
          <p className="text-gray-600">Free delivery for all orders over $140</p>
        </div>
        <div className="flex flex-col space-y-4 items-center text-center">
          <FaRegClock className="text-[4rem] md:text-[5rem] border rounded-full p-3 text-yellow-500" />
          <h1 className="text-xl md:text-2xl font-semibold">24/7 Customer Services</h1>
          <p className="text-gray-600">Friendly 24/7 Customer Services</p>
        </div>
        <div className="flex flex-col space-y-4 items-center text-center">
          <FaShieldAlt className="text-[4rem] md:text-[5rem] border rounded-full p-3 text-green-500" />
          <h1 className="text-xl md:text-2xl font-semibold">Money Back Guarantee</h1>
          <p className="text-gray-600">We return money within 30 days</p>
        </div>
      </div>


      {/* <div className='flex justify-around items-center'>
        <div className='flex flex-col space-y-5  items-center'>
            <FaBabyCarriage className='text-[6rem] border rounded-full' />
            <h1 className='text-2xl font-semibold'>Free And First Delivery</h1>
            <p className='text-lg'>Free delivery for all orders over $140</p>
        </div>
        <div className='flex flex-col space-y-5  items-center'>
            <FaRegClock className='text-[6rem] border rounded-full' />
            <h1 className='text-2xl font-semibold'>24/7 Customer Services</h1>
            <p className='text-lg'>Friendly 24/7 Customer Services</p>
        </div>
        <div className='flex flex-col space-y-5  items-center'>
            <FaShieldAlt className='text-[6rem] border rounded-full' />
            <h1 className='text-2xl font-semibold'>Money Back Guarantee</h1>
            <p className='text-lg'>We return money within 30 days</p>
        </div>
      </div> */}
    </div>
  );
};

export default Feature;