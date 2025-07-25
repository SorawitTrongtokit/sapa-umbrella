import { useState, useEffect } from 'react';

interface OfflineData {
  umbrellas: Record<number, any>;
  lastSync: number;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToCache = (data: OfflineData) => {
    try {
      localStorage.setItem('umbrella-cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  };

  const loadFromCache = (): OfflineData | null => {
    try {
      const cached = localStorage.getItem('umbrella-cache');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return null;
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem('umbrella-cache');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  };

  return {
    isOnline,
    saveToCache,
    loadFromCache,
    clearCache
  };
}
