import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
}

export const Button = ({ children, variant = 'default', className = '', ...props }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded transition";
  const variantClasses = variant === 'outline' 
    ? "border border-blue-600 text-blue-600 hover:bg-blue-50" 
    : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};