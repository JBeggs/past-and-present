/**
 * Unit tests for AuthContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    register: vi.fn(),
  },
  apiClient: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getCompanyId: vi.fn(),
    setToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setCompanyId: vi.fn(),
  },
  newsApi: {
    profile: { get: vi.fn() },
  },
}));

function TestConsumer() {
  const { user, profile, companyId, loading, signIn, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="profile">{profile ? 'has-profile' : 'none'}</span>
      <span data-testid="company">{companyId || 'none'}</span>
      <button data-testid="sign-in" onClick={() => signIn('testuser', 'testpass')} />
      <button data-testid="sign-out" onClick={() => signOut()} />
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.apiClient as any).getToken.mockReturnValue(null);
    (api.apiClient as any).getRefreshToken.mockReturnValue(null);
    (api.apiClient as any).getCompanyId.mockReturnValue(null);
  });

  it('provides useAuth hook', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });
  });

  it('signIn succeeds and sets user', async () => {
    (api.authApi.login as any).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      access: 'token',
      refresh: 'refresh',
      company: { id: 'co-1' },
    });
    (api.newsApi.profile.get as any).mockResolvedValue({
      user: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await act(async () => {
      screen.getByTestId('sign-in').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    expect(api.authApi.login).toHaveBeenCalledWith('testuser', 'testpass');
  });

  it('signIn returns error on failure', async () => {
    (api.authApi.login as any).mockRejectedValue(new Error('Invalid credentials'));

    let signInResult: { error: any } = { error: null };
    const TestConsumerWithResult = () => {
      const auth = useAuth();
      return (
        <div>
          <button
            data-testid="sign-in"
            onClick={async () => {
              signInResult = await auth.signIn('bad', 'bad');
            }}
          />
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestConsumerWithResult />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sign-in')).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByTestId('sign-in').click();
    });

    await waitFor(() => {
      expect(signInResult.error).toBeTruthy();
    });
  });

  it('signOut clears user and profile', async () => {
    (api.authApi.login as any).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      access: 'token',
      refresh: 'refresh',
      company: { id: 'co-1' },
    });
    (api.newsApi.profile.get as any).mockResolvedValue({
      user: '1',
      email: 'test@example.com',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await act(async () => {
      screen.getByTestId('sign-in').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    (api.authApi.logout as any).mockResolvedValue(undefined);

    await act(async () => {
      screen.getByTestId('sign-out').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
  });

  it('useAuth throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');
    consoleSpy.mockRestore();
  });
});
