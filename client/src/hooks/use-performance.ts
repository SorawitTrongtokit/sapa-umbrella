import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    // Measure initial load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      
      // Get memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      setMetrics({
        loadTime: loadTime - startTime,
        renderTime: performance.now() - startTime,
        memoryUsage
      });
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  const logMetrics = () => {
    if (metrics && process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Metrics:', {
        'Load Time': `${metrics.loadTime.toFixed(2)}ms`,
        'Render Time': `${metrics.renderTime.toFixed(2)}ms`,
        'Memory Usage': `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
      });
    }
  };

  return { metrics, logMetrics };
};
