/**
 * Component tests for ClientHeader
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientHeader from './ClientHeader';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockUseAuth = vi.fn();
const mockUseCart = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));
vi.mock('@/contexts/CartContext', () => ({
  useCart: () => mockUseCart(),
}));

describe('ClientHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'user' },
      signOut: vi.fn(),
      loading: false,
    });
    mockUseCart.mockReturnValue({ itemCount: 0, loading: false });
  });

  it('shows Sign In when user is not logged in', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      signOut: vi.fn(),
      loading: false,
    });
    render(<ClientHeader />);
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    expect(screen.getByText('Sign In')).toHaveAttribute('href', '/login');
  });

  it('shows cart and profile when user is logged in', async () => {
    render(<ClientHeader />);
    await waitFor(() => {
      expect(screen.getByLabelText('Shopping cart')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
  });

  it('shows cart count when itemCount > 0', async () => {
    mockUseCart.mockReturnValue({ itemCount: 3, loading: false });
    render(<ClientHeader />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('shows Orders link when user is admin', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'admin' },
      signOut: vi.fn(),
      loading: false,
    });
    render(<ClientHeader />);
    await waitFor(() => {
      expect(screen.getByLabelText('View orders')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('View orders')).toHaveAttribute('href', '/admin/orders');
  });

  it('calls signOut when sign out button clicked', async () => {
    const signOut = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { id: '1' },
      profile: { role: 'user' },
      signOut,
      loading: false,
    });
    render(<ClientHeader />);
    await waitFor(() => {
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Sign out'));
    expect(signOut).toHaveBeenCalled();
  });
});
