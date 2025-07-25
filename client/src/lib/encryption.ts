// Simple encryption/decryption utilities for password management
// Note: This is for educational/internal use only

import CryptoJS from 'crypto-js';

// Secret key for encryption (should be in environment variables in production)
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'umbrella-system-secret-key-2025-fallback';

export const encryptPassword = (password: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
};

export const decryptPassword = (encryptedPassword: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalPassword) {
      throw new Error('Invalid encrypted password');
    }
    
    return originalPassword;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
};

// Generate a secure random key (for production use)
export const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};
