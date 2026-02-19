/**
 * Component tests for AdminActions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminActions from './AdminActions';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('./ProductForm', () => ({ default: () => <div data-testid="product-form" /> }));
vi.mock('./CategoryManager', () => ({ default: ({ onClose }: { onClose: () => void }) => (
  <div data-testid="category-manager">
    <button onClick={onClose}>Close Categories</button>
  </div>
) }));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AdminActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ profile: { role: 'admin' } });
  });

  it('returns null when user is not admin or business_owner', () => {
    mockUseAuth.mockReturnValue({ profile: { role: 'user' } });
    const { container } = render(<AdminActions />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when profile is null', () => {
    mockUseAuth.mockReturnValue({ profile: null });
    const { container } = render(<AdminActions />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Store Management when user is admin', () => {
    render(<AdminActions />);
    expect(screen.getByText('Store Management')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toHaveAttribute('href', '/admin/inventory');
    expect(screen.getByText('Orders')).toHaveAttribute('href', '/admin/orders');
    expect(screen.getByText('Add Product')).toHaveAttribute('href', '/admin/inventory/add');
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders when user is business_owner', () => {
    mockUseAuth.mockReturnValue({ profile: { role: 'business_owner' } });
    render(<AdminActions />);
    expect(screen.getByText('Store Management')).toBeInTheDocument();
  });

  it('opens CategoryManager when Categories button clicked', () => {
    render(<AdminActions />);
    expect(screen.queryByTestId('category-manager')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Categories'));
    expect(screen.getByTestId('category-manager')).toBeInTheDocument();
  });

  it('closes CategoryManager when onClose called', () => {
    render(<AdminActions />);
    fireEvent.click(screen.getByText('Categories'));
    expect(screen.getByTestId('category-manager')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Categories'));
    expect(screen.queryByTestId('category-manager')).not.toBeInTheDocument();
  });
});
