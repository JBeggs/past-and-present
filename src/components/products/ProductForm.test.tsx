/**
 * Component tests for ProductForm
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductForm from './ProductForm';

vi.mock('@/lib/api', () => ({
  ecommerceApi: {
    categories: { list: vi.fn().mockResolvedValue([]) },
    products: {
      create: vi.fn().mockResolvedValue({ id: 'new-1' }),
      update: vi.fn().mockResolvedValue({ id: 'prod-1' }),
    },
  },
}));
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

describe('ProductForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form when no product provided', async () => {
    render(<ProductForm onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Vintage Leather Satchel/i)).toBeInTheDocument();
    });
  });

  it('renders edit form when product provided', async () => {
    const product = {
      id: 'prod-1',
      name: 'Test Product',
      slug: 'test-product',
      price: 99.99,
      description: 'A test',
    } as any;
    render(<ProductForm product={product} onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onClose when close button clicked', async () => {
    render(<ProductForm onClose={mockOnClose} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Vintage Leather Satchel/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((b) => b.className.includes('rounded-full'));
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
