/**
 * Performance Configuration for Firebase Free Tier
 * จำกัดการใช้งานให้อยู่ในขอบเขต Free Plan
 */

// Firebase Free Tier Limits
export const FIREBASE_LIMITS = {
  // Realtime Database: 1GB stored, 10GB/month transfer
  database: {
    maxActivities: 50, // จำกัดประวัติการยืม-คืน
    maxUsers: 500,     // จำกัดจำนวนผู้ใช้
    cleanupInterval: 24 * 60 * 60 * 1000, // ล้างข้อมูลเก่าทุก 24 ชั่วโมง
  },
  
  // Hosting: 10GB storage, 360MB/day transfer
  hosting: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB cache
    cacheTimeout: 5 * 60 * 1000,    // 5 นาที
  },
  
  // Authentication: 50,000 MAU
  auth: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 นาที
  }
};

// Performance Settings
export const PERFORMANCE_CONFIG = {
  // Lazy loading components
  lazyLoadDelay: 200,
  
  // Database optimization
  dbBatchSize: 10,
  dbTimeout: 5000,
  
  // Cache settings
  cacheStrategy: {
    umbrellas: 30 * 1000,      // 30 วินาที
    activities: 60 * 1000,     // 1 นาที
    userProfile: 5 * 60 * 1000, // 5 นาที
  },
  
  // Bundle optimization
  maxChunkSize: 200 * 1024, // 200KB per chunk
  
  // Image optimization
  imageFormats: ['webp', 'png', 'svg'],
  maxImageSize: 100 * 1024, // 100KB
};

// Monitoring & Analytics (disabled for free tier)
export const MONITORING_CONFIG = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enablePerformanceMonitoring: false,
  enableCrashlytics: false,
  
  // Only log errors in production
  logLevel: import.meta.env.PROD ? 'error' : 'debug',
};

export default {
  FIREBASE_LIMITS,
  PERFORMANCE_CONFIG,
  MONITORING_CONFIG,
};
