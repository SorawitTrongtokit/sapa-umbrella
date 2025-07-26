// Enhanced encryption/decryption utilities for password management
// Maintains Owner Dashboard password viewing capability
// Note: This is for educational/internal use only

import CryptoJS from 'crypto-js';

// Secret key for encryption (now using environment variables)
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'PCSHSPL-2025-UMBRELLA-SYSTEM-SECURE-KEY-v1.0.0';

// Additional security layer for sensitive operations
const ADMIN_SALT = 'PCSHSPL-ADMIN-SALT-2025';

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

// Enhanced encryption for owner-level access
export const encryptAdminData = (data: string): string => {
  try {
    const saltedKey = CryptoJS.SHA256(SECRET_KEY + ADMIN_SALT).toString();
    const encrypted = CryptoJS.AES.encrypt(data, saltedKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Admin encryption error:', error);
    throw new Error('Failed to encrypt admin data');
  }
};

export const decryptAdminData = (encryptedData: string): string => {
  try {
    const saltedKey = CryptoJS.SHA256(SECRET_KEY + ADMIN_SALT).toString();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, saltedKey);
    const originalData = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalData) {
      throw new Error('Invalid encrypted admin data');
    }
    
    return originalData;
  } catch (error) {
    console.error('Admin decryption error:', error);
    throw new Error('Failed to decrypt admin data');
  }
};

// Generate a secure random key (for production use)
export const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

// Hash function for additional security
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + ADMIN_SALT).toString();
};

// Validate password strength
export const validatePasswordStrength = (password: string): { 
  isStrong: boolean; 
  score: number; 
  feedback: string[] 
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('ควรมีตัวอักษรเล็ก');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('ควรมีตัวอักษรใหญ่');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('ควรมีตัวเลข');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('ควรมีอักขระพิเศษ');

  return {
    isStrong: score >= 4,
    score,
    feedback
  };
};
