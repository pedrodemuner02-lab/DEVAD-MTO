import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const types = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-success-50 border-success-200',
      iconClass: 'text-success-600',
      textClass: 'text-success-800',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-danger-50 border-danger-200',
      iconClass: 'text-danger-600',
      textClass: 'text-danger-800',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-warning-50 border-warning-200',
      iconClass: 'text-warning-600',
      textClass: 'text-warning-800',
    },
    info: {
      icon: Info,
      bgClass: 'bg-primary-50 border-primary-200',
      iconClass: 'text-primary-600',
      textClass: 'text-primary-800',
    },
  };

  const config = types[type] || types.success;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${config.bgClass}`}>
        <Icon className={`w-5 h-5 ${config.iconClass}`} />
        <p className={`text-sm font-medium ${config.textClass}`}>{message}</p>
        <button
          onClick={onClose}
          className={`ml-2 ${config.iconClass} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
