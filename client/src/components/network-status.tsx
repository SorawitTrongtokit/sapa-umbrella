import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Zap } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed
    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnectionSpeed = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g' || effectiveType === '3g') {
          setConnectionSpeed('fast');
        } else {
          setConnectionSpeed('slow');
        }
      };

      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm z-50">
        <WifiOff className="w-4 h-4 inline mr-2" />
        ออฟไลน์ - แสดงข้อมูลล่าสุดที่บันทึกไว้
      </div>
    );
  }

  if (connectionSpeed === 'slow') {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center text-sm z-50">
        <Zap className="w-4 h-4 inline mr-2" />
        การเชื่อมต่อช้า - กำลังโหลด...
      </div>
    );
  }

  return null;
}
