import bcrypt from 'bcryptjs';
import DOMPurify from 'dompurify';

/**
 * Security utilities for password hashing and input sanitization
 */

const SALT_ROUNDS = 10;

export const security = {
  /**
   * Hash a password using bcrypt
   */
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Verify a password against a hash
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput: (input: string): string => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: [] // Strip all attributes
    }).trim();
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  isValidPassword: (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'Password is valid' };
  },

  /**
   * Rate limiting tracker for login attempts
   */
  rateLimiter: (() => {
    const attempts: Map<string, { count: number; timestamp: number }> = new Map();
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    return {
      checkLimit: (identifier: string): { allowed: boolean; remainingTime?: number } => {
        const now = Date.now();
        const record = attempts.get(identifier);

        if (!record) {
          attempts.set(identifier, { count: 1, timestamp: now });
          return { allowed: true };
        }

        // Reset if window has passed
        if (now - record.timestamp > WINDOW_MS) {
          attempts.set(identifier, { count: 1, timestamp: now });
          return { allowed: true };
        }

        // Check if limit exceeded
        if (record.count >= MAX_ATTEMPTS) {
          const remainingTime = Math.ceil((WINDOW_MS - (now - record.timestamp)) / 1000 / 60);
          return { allowed: false, remainingTime };
        }

        // Increment attempt count
        record.count++;
        return { allowed: true };
      },

      reset: (identifier: string) => {
        attempts.delete(identifier);
      }
    };
  })()
};

