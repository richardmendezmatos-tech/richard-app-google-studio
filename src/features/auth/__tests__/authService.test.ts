import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  signUpMock,
  signInWithPasswordMock,
  signInWithOAuthMock,
  signInWithIdTokenMock,
  signOutMock,
  resetPasswordForEmailMock,
  resendMock,
  signInWithOtpMock,
  onAuthStateChangeMock,
  getSessionMock,
  updateUserMock,
  getUserMock,
  repoMock,
} = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signInWithOAuthMock: vi.fn(),
  signInWithIdTokenMock: vi.fn(),
  signOutMock: vi.fn(),
  resetPasswordForEmailMock: vi.fn(),
  resendMock: vi.fn(),
  signInWithOtpMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  getSessionMock: vi.fn(),
  updateUserMock: vi.fn(),
  getUserMock: vi.fn(),
  repoMock: vi.fn().mockImplementation(function () {
    return {
      getUserProfile: vi.fn().mockResolvedValue(null),
      saveUserProfile: vi.fn().mockResolvedValue(undefined),
      getUserRole: vi.fn().mockResolvedValue('user'),
      logActivity: vi.fn().mockResolvedValue(undefined),
      deleteRateLimit: vi.fn().mockResolvedValue(undefined),
      getUserByPasskeyId: vi.fn().mockResolvedValue(null),
    };
  }),
}));

vi.mock('@/shared/api/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: signUpMock,
      signInWithPassword: signInWithPasswordMock,
      signInWithOAuth: signInWithOAuthMock,
      signInWithIdToken: signInWithIdTokenMock,
      signOut: signOutMock,
      resetPasswordForEmail: resetPasswordForEmailMock,
      resend: resendMock,
      signInWithOtp: signInWithOtpMock,
      onAuthStateChange: onAuthStateChangeMock,
      getSession: getSessionMock,
      updateUser: updateUserMock,
      getUser: getUserMock,
    },
  })),
}));

vi.mock('@/entities/user/api/repositories/SupabaseUserRepository', () => ({
  SupabaseUserRepository: repoMock,
}));

import {
  signUpWithEmail,
  signInWithEmail,
  resendVerificationEmail,
  sendPasswordResetEmail,
  loginAdmin,
  isAdminEmail,
  sendMagicLink,
  signOutUser,
} from '../services/authService';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
  email_confirmed_at: null,
};

const mockSession = {
  access_token: 'token-123',
  refresh_token: 'refresh-123',
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
      writable: true,
    });
  });

  describe('signUpWithEmail', () => {
    it('should register and return requiresEmailConfirmation=false when session exists', async () => {
      signUpMock.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.requiresEmailConfirmation).toBe(false);
      expect(result.user.email).toBe('test@example.com');
    });

    it('should return requiresEmailConfirmation=true when no session', async () => {
      signUpMock.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await signUpWithEmail('test@example.com', 'password123');

      expect(result.requiresEmailConfirmation).toBe(true);
    });

    it('should throw on error', async () => {
      signUpMock.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Signup failed'),
      });

      await expect(signUpWithEmail('test@example.com', 'pass')).rejects.toThrow('Signup failed');
    });

    it('should assign admin role for admin emails', async () => {
      signUpMock.mockResolvedValue({
        data: { user: { ...mockUser, email: 'richardmendezmatos@gmail.com' }, session: mockSession },
        error: null,
      });

      const result = await signUpWithEmail('richardmendezmatos@gmail.com', 'pass123');
      expect(result.user.role).toBe('admin');
    });
  });

  describe('signInWithEmail', () => {
    it('should log in with valid credentials', async () => {
      signInWithPasswordMock.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await signInWithEmail('test@example.com', 'password123');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw on invalid credentials', async () => {
      signInWithPasswordMock.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid login credentials'),
      });

      await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toThrow();
    });
  });

  describe('resendVerificationEmail', () => {
    it('should call supabase resend with signup type', async () => {
      resendMock.mockResolvedValue({ error: null });

      await resendVerificationEmail('test@example.com');

      expect(resendMock).toHaveBeenCalledWith({ type: 'signup', email: 'test@example.com' });
    });

    it('should throw on error', async () => {
      resendMock.mockResolvedValue({ error: new Error('Rate limit') });

      await expect(resendVerificationEmail('test@example.com')).rejects.toThrow('Rate limit');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should call resetPasswordForEmail', async () => {
      resetPasswordForEmailMock.mockResolvedValue({ error: null });

      await sendPasswordResetEmail('test@example.com');

      expect(resetPasswordForEmailMock).toHaveBeenCalled();
    });
  });

  describe('loginAdmin', () => {
    it('should log in admin with valid credentials', async () => {
      signInWithPasswordMock.mockResolvedValue({
        data: { user: { ...mockUser, email: 'admin@richard.com' } },
        error: null,
      });

      const result = await loginAdmin('admin@richard.com', 'admin123');
      expect(result.email).toBe('admin@richard.com');
    });
  });

  describe('sendMagicLink', () => {
    it('should send OTP email', async () => {
      signInWithOtpMock.mockResolvedValue({ error: null });

      await sendMagicLink('test@example.com');

      expect(signInWithOtpMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: expect.objectContaining({ emailRedirectTo: expect.any(String) }),
      });
    });
  });

  describe('signOutUser', () => {
    it('should call supabase signOut', async () => {
      getSessionMock.mockResolvedValue({ data: { session: { user: { email: 'test@example.com' } } } });
      signOutMock.mockResolvedValue({ error: null });

      await signOutUser();

      expect(signOutMock).toHaveBeenCalled();
    });
  });

  describe('isAdminEmail', () => {
    it('should identify richardmendezmatos@gmail.com as admin', () => {
      expect(isAdminEmail('richardmendezmatos@gmail.com')).toBe(true);
    });

    it('should identify @richard-automotive.com emails as admin', () => {
      expect(isAdminEmail('user@richard-automotive.com')).toBe(true);
    });

    it('should identify admin_vip emails as admin', () => {
      expect(isAdminEmail('admin_vip@test.com')).toBe(true);
    });

    it('should reject regular emails', () => {
      expect(isAdminEmail('user@gmail.com')).toBe(false);
    });

    it('should handle null email', () => {
      expect(isAdminEmail(null)).toBe(false);
    });
  });
});
