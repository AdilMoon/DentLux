import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2';

  const variants = {
    primary: 'bg-primary-900 text-white border-primary-900 hover:bg-white hover:text-primary-900 dark:bg-accent-600 dark:border-accent-600 dark:hover:bg-primary-950 dark:hover:text-accent-600 focus:ring-primary-900',
    secondary: 'bg-white text-primary-900 border-primary-900 hover:bg-primary-900 hover:text-white dark:bg-transparent dark:text-primary-100 dark:border-primary-100 dark:hover:bg-primary-100 dark:hover:text-primary-950 focus:ring-primary-900',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-white hover:text-red-600 dark:hover:bg-primary-950 focus:ring-red-500',
    success: 'bg-green-600 text-white border-green-600 hover:bg-white hover:text-green-600 dark:hover:bg-primary-950 focus:ring-green-500',
    ghost: 'bg-transparent text-primary-900 border-transparent hover:border-primary-900 dark:text-primary-300 dark:hover:border-primary-700 focus:ring-primary-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
