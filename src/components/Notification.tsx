import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{message}</span>
      {onClose && (
        <button className="notification-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};
