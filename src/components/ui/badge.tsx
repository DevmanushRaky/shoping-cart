import React from 'react';
import classNames from 'classnames';

interface BadgeProps {
  variant?: 'default' | 'destructive' | 'secondary' | 'success' | 'outline';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const badgeClass = classNames(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    {
      'bg-gray-100 text-gray-800': variant === 'default',
      'bg-red-100 text-red-800': variant === 'destructive',
      'bg-blue-100 text-blue-800': variant === 'secondary',
      'bg-green-100 text-green-800': variant === 'success',
      'border border-gray-300 text-gray-800': variant === 'outline',
    },
    className
  );

  return <span className={badgeClass}>{children}</span>;
};