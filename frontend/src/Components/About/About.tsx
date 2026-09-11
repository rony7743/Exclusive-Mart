import React from 'react';
import { FaHome, FaDollarSign, FaShopify, FaInstagramSquare, FaRegClock, FaShieldAlt, FaBabyCarriage } from "react-icons/fa";
import { FaSackDollar, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const About: React.FC = () => {
  return (
    <div className="p-5 md:p-10 space-y-16">
      
      {/* Breadcrumb */}
      <h1 className="text-gray-500">Home / About</h1>

      {/* Our Story Section */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-10">
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl font-bold">Our Story</h1>
          <p className="text-gray-700">
            Launched in 2015, Exclusive is South Asia’s premier online shopping marketplace with an active presence in Bangladesh.
            Supported by a wide range of tailored marketing, data, and service solutions, Exclusive has 10,500 sellers and 300 brands
            and serves 3 million customers across the region.
          </p>
          <p className="text-gray-700">
            Exclusive has more than 1 million products to offer and is growing very fast. It offers a diverse assortment in categories ranging from consumer goods to electronics.
          </p>
        </div>
        <div className="flex-1">
          <img src="/about/a.svg" alt="About Us" className="w-full max-w-md mx-auto" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
        <div className="border p-6 rounded shadow">
          <FaHome className="text-4xl text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">10.5K</h1>
          <p className="text-gray-600">Sellers active on our site</p>
        </div>
        <div className="border p-6 rounded shadow">
          <FaDollarSign className="text-4xl text-green-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">3M</h1>
          <p className="text-gray-600">Customers active on our site</p>
        </div>
        <div className="border p-6 rounded shadow">
          <FaShopify className="text-4xl text-orange-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">1M</h1>
          <p className="text-gray-600">Products available on our site</p>
        </div>
        <div className="border p-6 rounded shadow">
          <FaSackDollar className="text-4xl text-purple-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">300</h1>
          <p className="text-gray-600">Brands available on our site</p>
        </div>
      </div>

      {/* Team Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
  {[1, 2, 3].map((_, index) => (
    <div key={index} className="flex flex-col items-center text-center space-y-3">
      <img
        src={`/about/${String.fromCharCode(98 + index)}.svg`}
        alt={`Team Member ${index + 1}`}
        className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover rounded-full shadow-md"
      />
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tom Cruise</h1>
      <div className="flex justify-center space-x-4 text-xl text-gray-600">
        <FaLinkedin className="hover:text-blue-700 transition duration-300 cursor-pointer" />
        <FaInstagramSquare className="hover:text-pink-600 transition duration-300 cursor-pointer" />
        <FaXTwitter className="hover:text-black transition duration-300 cursor-pointer" />
      </div>
    </div>
  ))}
</div>


      {/* Services Section */}
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
    </div>
 
  );
};

export default About;
