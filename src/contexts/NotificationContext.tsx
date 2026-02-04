
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((type: NotificationType, message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      
      {/* Toast Container Rendered directly by provider for global access */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 text-white min-w-[300px] max-w-sm animate-in slide-in-from-right-10 fade-in duration-300
              ${notif.type === 'success' ? 'bg-emerald-600/90 shadow-emerald-900/20' : ''}
              ${notif.type === 'error' ? 'bg-rose-600/90 shadow-rose-900/20' : ''}
              ${notif.type === 'info' ? 'bg-slate-800/90 shadow-slate-900/20' : ''}
            `}
          >
            <div className="mt-0.5">
              {notif.type === 'success' && <CheckCircle size={18} />}
              {notif.type === 'error' && <AlertCircle size={18} />}
              {notif.type === 'info' && <Info size={18} />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{notif.message}</div>
            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
