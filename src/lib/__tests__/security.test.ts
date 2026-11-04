import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateEmail, isStrongPassword } from '../security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove XSS attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should preserve safe HTML', () => {
      const safe = 'Hello World';
      const sanitized = sanitizeInput(safe);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should accept strong passwords', () => {
      expect(isStrongPassword('MyP@ssw0rd123')).toBe(true);
      expect(isStrongPassword('Str0ng!Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
    });

    it('should require minimum length', () => {
      expect(isStrongPassword('Sh0rt!')).toBe(false);
      expect(isStrongPassword('L0nger!Pass')).toBe(true);
    });
  });
});



