import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  onIconClick,
  className = '',
  ...props
}) => {
  const inputClasses = `
    input-field
    ${Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div 
            className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center ${onIconClick ? 'cursor-pointer' : ''}`}
            onClick={onIconClick}
          >
            <Icon 
              size={18} 
              className={`text-gray-400 ${onIconClick ? 'hover:text-gray-600 dark:hover:text-gray-300' : ''}`} 
            />
          </div>
        )}
        
        <input className={inputClasses} {...props} />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
    </div>
  );
};