import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoadingSpinnerProps {
  message?: string;
  size?: string; // e.g., 'text-2xl', 'text-4xl'
  color?: string; // e.g., 'text-blue-500', 'text-gray-700'
  className?: string; // For additional custom styling
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'text-4xl',
  color = 'text-blue-500',
  className = '',
}) => {
  return (
    <div className={`flex flex-col justify-center items-center min-h-[200px] ${className}`}>
      <FaSpinner className={`animate-spin ${size} ${color} mx-auto mb-4`} />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;