import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { redirect } from 'next/navigation';
import { signInAction, logoutAction } from '@/server/actions/admin.actions';
import { createSession, deleteSession } from '@/server/auth/dal.auth';
import { serverConfig } from '@/config';

// Mock dependencies
vi.mock('@/server/auth/dal.auth', () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/config', () => ({
  serverConfig: {
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'password123',
  },
}));

describe('Admin Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signInAction', () => {
    it('creates a session and redirects when credentials are valid', async () => {
      // Create form data with valid credentials
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'password123');

      // Call the action
      await signInAction(formData);

      // Check that createSession was called with the username
      expect(createSession).toHaveBeenCalledWith('admin');
      expect(createSession).toHaveBeenCalledTimes(1);

      // Check that redirect was called to the dashboard
      expect(redirect).toHaveBeenCalledWith('/admin/dashboard');
      expect(redirect).toHaveBeenCalledTimes(1);
    });

    it('does not create a session or redirect when username is invalid', async () => {
      // Create form data with invalid username
      const formData = new FormData();
      formData.append('username', 'wrong_user');
      formData.append('password', 'password123');

      // Call the action
      await signInAction(formData);

      // Check that createSession was not called
      expect(createSession).not.toHaveBeenCalled();

      // Check that redirect was not called
      expect(redirect).not.toHaveBeenCalled();
    });

    it('does not create a session or redirect when password is invalid', async () => {
      // Create form data with invalid password
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'wrong_password');

      // Call the action
      await signInAction(formData);

      // Check that createSession was not called
      expect(createSession).not.toHaveBeenCalled();

      // Check that redirect was not called
      expect(redirect).not.toHaveBeenCalled();
    });

    it('handles empty form data', async () => {
      // Create empty form data
      const formData = new FormData();

      // Call the action
      await signInAction(formData);

      // Check that createSession was not called
      expect(createSession).not.toHaveBeenCalled();

      // Check that redirect was not called
      expect(redirect).not.toHaveBeenCalled();
    });

    it('handles null or undefined form values', async () => {
      // Create a mock FormData with methods that return null
      const mockFormData = {
        get: vi.fn().mockReturnValue(null),
      } as unknown as FormData;

      // Call the action
      await signInAction(mockFormData);

      // Check that createSession was not called
      expect(createSession).not.toHaveBeenCalled();

      // Check that redirect was not called
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('logoutAction', () => {
    it('deletes the session and redirects to login', async () => {
      // Call the action
      await logoutAction();

      // Check that deleteSession was called
      expect(deleteSession).toHaveBeenCalledTimes(1);

      // Check that redirect was called to the login page
      expect(redirect).toHaveBeenCalledWith('/admin/login');
      expect(redirect).toHaveBeenCalledTimes(1);
    });

    it('still redirects if deleteSession throws an error', async () => {
      // Setup deleteSession to throw an error
      (deleteSession as any).mockImplementationOnce(() => {
        throw new Error('Failed to delete session');
      });

      // We need to catch the error since we expect it might throw
      try {
        await logoutAction();
      } catch (error) {
        // We expect an error to be thrown
      }

      // Check that redirect was still called
      expect(redirect).toHaveBeenCalledWith('/admin/login');
    });
  });

  describe('Integration with serverConfig', () => {
    it('respects changes to serverConfig values', async () => {
      // Temporarily modify the mocked serverConfig
      (serverConfig as any).ADMIN_USERNAME = 'different_admin';
      (serverConfig as any).ADMIN_PASSWORD = 'different_password';

      // Create form data with the new valid credentials
      const formData = new FormData();
      formData.append('username', 'different_admin');
      formData.append('password', 'different_password');

      // Call the action
      await signInAction(formData);

      // Check that createSession was called with the new username
      expect(createSession).toHaveBeenCalledWith('different_admin');
      expect(redirect).toHaveBeenCalledWith('/admin/dashboard');

      // Reset the serverConfig for other tests
      (serverConfig as any).ADMIN_USERNAME = 'admin';
      (serverConfig as any).ADMIN_PASSWORD = 'password123';
    });
  });

  describe('Error handling', () => {
    it('handles createSession failures', async () => {
      // Setup createSession to throw an error
      (createSession as any).mockRejectedValueOnce(new Error('Database connection failed'));

      // Create form data with valid credentials
      const formData = new FormData();
      formData.append('username', 'admin');
      formData.append('password', 'password123');

      // We expect the action to throw
      await expect(signInAction(formData)).rejects.toThrow('Database connection failed');

      // Session creation was attempted
      expect(createSession).toHaveBeenCalledWith('admin');

      // But no redirect happened
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
