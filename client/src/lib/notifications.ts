export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(title: string, options?: NotificationOptions) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        ...options
      });
    } else {
      new Notification(title, options);
    }
  }

  notifyUmbrellaAvailable(umbrellaId: number, location: string) {
    this.showNotification(
      `ร่ม #${umbrellaId} พร้อมใช้งานแล้ว!`,
      {
        body: `ร่มที่ ${location} สามารถยืมได้แล้ว`,
        tag: `umbrella-${umbrellaId}`,
        requireInteraction: false,
        silent: false
      }
    );
  }

  notifyLowUmbrellaCount(location: string, count: number) {
    if (count <= 2) {
      this.showNotification(
        `ร่มเหลือน้อย!`,
        {
          body: `${location} เหลือร่มอีกเพียง ${count} คัน`,
          tag: `low-count-${location}`,
          requireInteraction: true
        }
      );
    }
  }
}
