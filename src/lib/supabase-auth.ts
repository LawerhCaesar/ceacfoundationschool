/**
 * Supabase Authentication Module
 * 
 * Handles user authentication operations including:
 * - User registration with email verification
 * - User login with credential validation
 * - User logout
 * - Current user session management
 * 
 * @module supabase-auth
 * @version 1.0.0
 */

import { supabase } from './supabase';
import { security } from './security';

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    church?: string | null;
    fellowship?: string | null;
    cell?: string | null;
    role: 'student' | 'teacher' | 'admin' | 'pastor';
    profilePictureUrl?: string | null;
    registeredAt: string;
  };
  error?: string;
  needsEmailConfirmation?: boolean;
}

export const supabaseAuth = {
  /**
   * Register a new user
   */
  register: async (
    email: string,
    name: string,
    password: string,
    church?: string,
    fellowship?: string,
    cell?: string
  ): Promise<AuthResult> => {
    try {
      // Sanitize inputs (email needs trim only, others use full sanitization)
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedName = security.sanitizeInput(name);
      const sanitizedChurch = church ? security.sanitizeInput(church) : undefined;
      const sanitizedFellowship = fellowship ? security.sanitizeInput(fellowship) : undefined;
      const sanitizedCell = cell ? security.sanitizeInput(cell) : undefined;

      // Validate email
      if (!security.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      const passwordValidation = security.isValidPassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Check if email confirmation is required
      const needsEmailConfirmation = authData.user && !authData.session;

      // Create user profile in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: sanitizedEmail,
          name: sanitizedName,
          church: sanitizedChurch,
          fellowship: sanitizedFellowship,
          cell: sanitizedCell,
          role: 'student',
        })
        .select()
        .single();

      if (userError) {
        // Note: Cannot delete auth user from client (requires admin key)
        // User will exist in auth but not in users table
        console.error('User profile creation failed:', userError);
        return { success: false, error: 'Failed to create user profile. Please contact support.' };
      }

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          church: userData.church,
          fellowship: userData.fellowship,
          cell: userData.cell,
          role: userData.role,
          profilePictureUrl: userData.profile_picture_url,
          registeredAt: userData.registered_at,
        },
        needsEmailConfirmation,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Rate limiting check
      const rateLimit = security.rateLimiter.checkLimit(email);
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: `Too many login attempts. Please try again in ${rateLimit.remainingTime} minutes.`,
        };
      }

      // Trim and lowercase email (don't use sanitizeInput as it strips valid email characters)
      const sanitizedEmail = email.trim().toLowerCase();

      // Validate email format
      if (!security.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (authError) {
        // Check if email confirmation is required
        if (authError.message.includes('Email not confirmed') || authError.message.includes('email_not_confirmed')) {
          return { 
            success: false, 
            error: 'Please check your email and confirm your account before logging in. Check your spam folder if you don\'t see the email.' 
          };
        }
        if (authError.message.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. If you just registered, please confirm your email first.' 
          };
        }
        return { success: false, error: authError.message || 'Invalid email or password' };
      }

      if (!authData.user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Get user profile from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'User profile not found' };
      }

      // Reset rate limiter on successful login
      security.rateLimiter.reset(sanitizedEmail);

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          church: userData.church,
          fellowship: userData.fellowship,
          cell: userData.cell,
          role: userData.role,
          profilePictureUrl: userData.profile_picture_url,
          registeredAt: userData.registered_at,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'An unexpected error occurred during logout' };
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<AuthResult['user'] | null> => {
    try {
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Get user profile from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        church: userData.church,
        fellowship: userData.fellowship,
        cell: userData.cell,
        role: userData.role,
        profilePictureUrl: userData.profile_picture_url,
        registeredAt: userData.registered_at,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  /**
   * Change user password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate new password strength
      const passwordValidation = security.isValidPassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Check if passwords are the same
      if (currentPassword === newPassword) {
        return { success: false, error: 'New password must be different from current password' };
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'You must be logged in to change your password' };
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: currentPassword,
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'An unexpected error occurred while changing password' };
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Trim and lowercase email (don't use sanitizeInput as it strips valid email characters)
      const sanitizedEmail = email.trim().toLowerCase();
      
      if (!security.isValidEmail(sanitizedEmail)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', sanitizedEmail)
        .single();

      if (userError || !userData) {
        // Don't reveal if user exists for security reasons
        // Return success anyway to prevent email enumeration
        return { success: true };
      }

      // Use current origin so it works across www/non-www and different environments.
      // Ensure your Supabase project has all redirect URLs whitelisted (Dashboard > Auth > URL Configuration).
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'https://ceacfoundationschool.com/reset-password';

      const { data, error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo,
      });

      if (error) {
        console.error('Password reset error:', error);
        const msg = error.message.toLowerCase();
        if (msg.includes('rate limit') || msg.includes('too many')) {
          return {
            success: false,
            error: 'Too many requests. Please wait about an hour before trying again.',
          };
        }
        return { success: false, error: 'Failed to send reset email: ' + error.message };
      }

      console.log('Password reset email sent successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Update password with reset token (called after clicking email link)
   */
  updatePasswordFromReset: async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate new password strength
      const passwordValidation = security.isValidPassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'An unexpected error occurred while updating password' };
    }
  },
};

