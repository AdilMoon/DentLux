import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', footer }) => {
  return (
    <div className={`bg-white dark:bg-primary-900 border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden transition-colors ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b-2 border-primary-900 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
          <h3 className="text-xl font-black text-primary-900 dark:text-white uppercase tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 text-primary-900 dark:text-primary-100">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-primary-50 dark:bg-primary-950 border-t-2 border-primary-900 dark:border-primary-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
