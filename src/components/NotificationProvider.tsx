import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => void;
  error: (message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => void;
  warning: (message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => void;
  info: (message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (default 5 seconds)
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => {
    addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const error = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => {
    addNotification({ type: 'error', message, persistent: true, ...options });
  }, [addNotification]);

  const warning = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => {
    addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const info = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type'>>) => {
    addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'error':
        return '';
    }
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Alert 
                variant={getAlertVariant(notification.type)}
                className={`
                  relative shadow-lg
                  ${notification.type !== 'error' ? getTypeStyles(notification.type) : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    ${notification.type === 'success' ? 'text-green-600 dark:text-green-400' : ''}
                    ${notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                    ${notification.type === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <div className="font-medium mb-1">{notification.title}</div>
                    )}
                    <AlertDescription className="text-sm">
                      {notification.message}
                    </AlertDescription>
                    
                    {notification.action && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={notification.action.onClick}
                          className="h-7 text-xs"
                        >
                          {notification.action.label}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}