// Security utilities for Firebase free tier
import { trackError } from './analytics';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 1000); // Limit length
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone validation (Thai format)
export const isValidThaiPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Password strength validation
export const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;

  return {
    isValid: score >= 3,
    score,
    feedback: {
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      numbers: hasNumbers,
      special: hasSpecialChar
    }
  };
};

// Rate limiting storage
interface RateLimitData {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private key: string;
  private limit: number;
  private windowMs: number;

  constructor(key: string, limit: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.key = key;
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(): { allowed: boolean; remaining: number; resetTime: number } {
    try {
      const stored = localStorage.getItem(`rate_limit_${this.key}`);
      const now = Date.now();
      
      let data: RateLimitData = { count: 0, resetTime: now + this.windowMs };
      
      if (stored) {
        data = JSON.parse(stored);
        
        // Reset if window has expired
        if (now > data.resetTime) {
          data = { count: 0, resetTime: now + this.windowMs };
        }
      }

      const allowed = data.count < this.limit;
      const remaining = Math.max(0, this.limit - data.count);

      return { allowed, remaining, resetTime: data.resetTime };
    } catch (error) {
      trackError(error as Error, 'RateLimiter.check');
      return { allowed: true, remaining: this.limit, resetTime: Date.now() + this.windowMs };
    }
  }

  consume(): boolean {
    try {
      const status = this.check();
      
      if (!status.allowed) {
        return false;
      }

      const stored = localStorage.getItem(`rate_limit_${this.key}`);
      const now = Date.now();
      
      let data: RateLimitData = { count: 1, resetTime: now + this.windowMs };
      
      if (stored) {
        data = JSON.parse(stored);
        if (now <= data.resetTime) {
          data.count += 1;
        } else {
          data = { count: 1, resetTime: now + this.windowMs };
        }
      }

      localStorage.setItem(`rate_limit_${this.key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      trackError(error as Error, 'RateLimiter.consume');
      return true; // Allow on error
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(`rate_limit_${this.key}`);
    } catch (error) {
      trackError(error as Error, 'RateLimiter.reset');
    }
  }
}

// Content Security Policy helpers
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'ประเภทไฟล์ไม่ได้รับอนุญาต' };
  }

  return { valid: true };
};

// Session security
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// XSS protection
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// SQL injection protection (for any future database queries)
export const escapeSqlString = (str: string): string => {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%": return "\\" + char;
      default: return char;
    }
  });
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return generateSessionToken();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};
