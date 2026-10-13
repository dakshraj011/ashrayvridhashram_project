import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import type { NotificationItem } from '../types';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      // Quiet fail if not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-maroon dark:text-gold hover:bg-gold/10 transition-colors focus:outline-none"
        title="सूचनाएँ"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-saffron text-white font-bold text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border-2 border-gold/40 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 bg-maroon dark:bg-slate-950 text-white flex justify-between items-center border-b border-gold/30">
            <h4 className="font-heading font-bold text-lg text-gold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> सूचनाएँ ({unreadCount} नई)
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gold/80 hover:text-gold underline"
            >
              बंद करें
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-slate-500 text-sm">कोई नई सूचना नहीं है।</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl transition-colors ${
                    n.is_read === 0 ? 'bg-saffron/10 dark:bg-saffron/20 border-l-4 border-saffron' : 'opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{n.title}</h5>
                    {n.is_read === 0 && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                        title="पढ़ा चिन्हित करें"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('hi-IN') : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
