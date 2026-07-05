import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High Risk Scam Detected',
      message: 'A fake offer letter from "Wipro Recruitments" requesting registration deposit was verified.',
      type: 'High',
      timestamp: '10 mins ago',
      read: false
    },
    {
      id: 2,
      title: 'Critical Threat Alert',
      message: 'New phishing campaign targeting graduates impersonating "Infosys HR". Check sender domains.',
      type: 'Medium',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: 3,
      title: 'Safe Verification Completed',
      message: 'The website "careers.google.com" is fully verified as genuine.',
      type: 'Safe',
      timestamp: '1 day ago',
      read: true
    }
  ]);

  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Add to notification panel list
    setNotifications((prev) => [
      {
        id,
        title,
        message,
        type,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, toasts, addToast, markAllRead, clearNotification }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>{toast.title}</strong>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
