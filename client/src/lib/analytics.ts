// Simple analytics for Firebase free tier
interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: string;
}

class SimpleAnalytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100; // Keep only recent events

  logEvent(name: string, parameters?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      parameters,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);
    
    // Keep only recent events to prevent localStorage overflow
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_analytics', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to store analytics:', error);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', name, parameters);
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getUserStats() {
    const loginEvents = this.events.filter(e => e.name === 'user_login');
    const pageViews = this.events.filter(e => e.name === 'page_view');
    const errors = this.events.filter(e => e.name === 'error');

    return {
      totalLogins: loginEvents.length,
      totalPageViews: pageViews.length,
      totalErrors: errors.length,
      lastActivity: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
    };
  }

  clearEvents() {
    this.events = [];
    localStorage.removeItem('app_analytics');
  }

  // Initialize from localStorage
  init() {
    try {
      const stored = localStorage.getItem('app_analytics');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics:', error);
      this.events = [];
    }
  }
}

export const analytics = new SimpleAnalytics();

// Initialize on module load
analytics.init();

// Track page views automatically
export const trackPageView = (page: string) => {
  analytics.logEvent('page_view', { page, url: window.location.href });
};

// Track user actions
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  analytics.logEvent('user_action', { action, ...details });
};

// Track errors
export const trackError = (error: Error, context?: string) => {
  analytics.logEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
    url: window.location.href
  });
};
