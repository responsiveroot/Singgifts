import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]}`}></div>
  );
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-inter">Loading...</p>
    </div>
  </div>
);

export const ButtonSpinner = () => (
  <LoadingSpinner size="sm" color="white" />
);

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="md" />
    <span className="ml-3 text-gray-600 font-inter">{text}</span>
  </div>
);