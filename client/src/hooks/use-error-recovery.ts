import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export const useErrorRecovery = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null
  });

  const logError = useCallback((error: Error, errorInfo?: any) => {
    const errorId = Date.now().toString();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error caught:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you could send to error tracking service
    // For Firebase free tier, we'll use Firebase Analytics events
    if (process.env.NODE_ENV === 'production') {
      try {
        // Log to localStorage for now (could be sent to Firebase Analytics)
        const errorLog = {
          timestamp: new Date().toISOString(),
          message: error.message,
          stack: error.stack,
          errorId,
          userAgent: navigator.userAgent,
          url: window.location.href
        };

        const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        const updatedLogs = [...existingLogs, errorLog].slice(-10); // Keep only last 10 errors
        localStorage.setItem('error_logs', JSON.stringify(updatedLogs));
      } catch (e) {
        console.warn('Failed to log error:', e);
      }
    }

    setErrorState({
      hasError: true,
      error,
      errorId
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null
    });
  }, []);

  const retry = useCallback((callback: () => void) => {
    clearError();
    try {
      callback();
    } catch (error) {
      logError(error as Error);
    }
  }, [clearError, logError]);

  return {
    ...errorState,
    logError,
    clearError,
    retry
  };
};
