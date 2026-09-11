import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-red-600 animate-pulse">
          404
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
          The page you requested could not be found.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block px-6 py-3 bg-red-600 text-white text-base sm:text-lg font-semibold rounded-lg shadow-md hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;