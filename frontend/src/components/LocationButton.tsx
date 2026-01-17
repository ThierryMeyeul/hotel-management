import React from 'react';
import { Navigation, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface LocationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  hasLocation?: boolean;
  error?: string | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  hasLocation = false,
  error = null,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300',
    outline: 'bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50',
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin w-5 h-5" />;
    }
    if (hasLocation) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (error) {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <Navigation className="w-5 h-5" />;
  };

  const getText = () => {
    if (isLoading) return 'Localisation...';
    if (hasLocation) return 'Position obtenue';
    if (error) return 'Erreur GPS';
    return 'Utiliser ma position';
  };

  const getTooltip = () => {
    if (error) return error;
    if (hasLocation) return 'Position actuelle disponible';
    return 'Cliquez pour utiliser votre position';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={getTooltip()}
      aria-label={getTooltip()}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${error ? '!bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-100' : ''}
        ${hasLocation ? '!bg-green-50 !text-green-700 !border-green-200 hover:!bg-green-100' : ''}
        font-medium rounded-lg transition-all duration-200
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'primary' ? 'focus:ring-indigo-500' : 'focus:ring-gray-300'}
        ${className}
      `}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
};

export default LocationButton;