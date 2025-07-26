import { useState, useEffect } from 'react';

// Rate limiting hook for login attempts
export const useRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => { // 15 minutes
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('login_attempts');
    if (stored) {
      const { count, timestamp } = JSON.parse(stored);
      const now = Date.now();
      
      if (now - timestamp < windowMs) {
        setAttempts(count);
        if (count >= maxAttempts) {
          setIsBlocked(true);
          setBlockEndTime(timestamp + windowMs);
        }
      } else {
        // Reset attempts after window expires
        localStorage.removeItem('login_attempts');
        setAttempts(0);
        setIsBlocked(false);
      }
    }
  }, [maxAttempts, windowMs]);

  useEffect(() => {
    if (blockEndTime) {
      const timer = setInterval(() => {
        if (Date.now() >= blockEndTime) {
          setIsBlocked(false);
          setBlockEndTime(null);
          setAttempts(0);
          localStorage.removeItem('login_attempts');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [blockEndTime]);

  const recordAttempt = () => {
    const newAttempts = attempts + 1;
    const timestamp = Date.now();
    
    setAttempts(newAttempts);
    localStorage.setItem('login_attempts', JSON.stringify({
      count: newAttempts,
      timestamp
    }));

    if (newAttempts >= maxAttempts) {
      setIsBlocked(true);
      setBlockEndTime(timestamp + windowMs);
    }
  };

  const reset = () => {
    setAttempts(0);
    setIsBlocked(false);
    setBlockEndTime(null);
    localStorage.removeItem('login_attempts');
  };

  const remainingTime = blockEndTime ? Math.max(0, blockEndTime - Date.now()) : 0;

  return {
    attempts,
    isBlocked,
    remainingTime,
    recordAttempt,
    reset,
    maxAttempts
  };
};
