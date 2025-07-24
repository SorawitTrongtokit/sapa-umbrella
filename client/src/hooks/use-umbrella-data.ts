import { useState, useEffect } from 'react';
import { subscribeToUmbrellas, subscribeToActivities, initializeUmbrellas } from '@/lib/firebase';
import type { Umbrella } from '@shared/schema';

export function useUmbrellaData() {
  const [umbrellas, setUmbrellas] = useState<Record<number, Umbrella>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize umbrellas on first load
    initializeUmbrellas();

    const unsubscribeUmbrellas = subscribeToUmbrellas((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUmbrellas(data);
      }
      setLoading(false);
    });

    const unsubscribeActivities = subscribeToActivities((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as object)
        })).sort((a: any, b: any) => b.timestamp - a.timestamp);
        setActivities(activitiesArray);
      }
    });

    return () => {
      unsubscribeUmbrellas();
      unsubscribeActivities();
    };
  }, []);

  const getAvailableUmbrellas = () => {
    return Object.values(umbrellas).filter(u => u.status === 'available');
  };

  const getBorrowedUmbrellas = () => {
    return Object.values(umbrellas).filter(u => u.status === 'borrowed');
  };

  const getUmbrellasByLocation = (location: string) => {
    return Object.values(umbrellas).filter(u => u.currentLocation === location);
  };

  const getRecentActivities = (limit = 5) => {
    return activities.slice(0, limit);
  };

  return {
    umbrellas,
    activities,
    loading,
    availableCount: getAvailableUmbrellas().length,
    borrowedCount: getBorrowedUmbrellas().length,
    getAvailableUmbrellas,
    getBorrowedUmbrellas,
    getUmbrellasByLocation,
    getRecentActivities
  };
}
