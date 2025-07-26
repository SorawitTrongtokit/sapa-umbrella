import { describe, it, expect } from 'vitest';
import { encryptPassword, decryptPassword } from '@/lib/encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt password correctly', () => {
    const originalPassword = 'testPassword123';
    const encrypted = encryptPassword(originalPassword);
    const decrypted = decryptPassword(encrypted);
    
    expect(encrypted).not.toBe(originalPassword);
    expect(decrypted).toBe(originalPassword);
  });

  it('should throw error for invalid encrypted password', () => {
    expect(() => decryptPassword('invalid-encrypted-string')).toThrow();
  });
});
