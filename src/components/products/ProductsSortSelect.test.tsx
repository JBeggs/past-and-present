/**
 * Component tests for ProductsSortSelect
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsSortSelect from './ProductsSortSelect';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('page=2&condition=vintage'),
}));

describe('ProductsSortSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sort options', () => {
    render(<ProductsSortSelect />);
    expect(screen.getByText('Sort:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Default' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Name A–Z' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Price: Low to High' })).toBeInTheDocument();
  });

  it('uses currentSort when provided', () => {
    render(<ProductsSortSelect currentSort="-price" />);
    expect(screen.getByRole('combobox')).toHaveValue('-price');
  });

  it('calls router.push with sort param on change', () => {
    render(<ProductsSortSelect />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price' } });
    expect(mockPush).toHaveBeenCalledWith('/products?page=1&condition=vintage&sort=price');
  });

  it('removes sort when Default selected', () => {
    render(<ProductsSortSelect currentSort="price" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(mockPush).toHaveBeenCalledWith('/products?page=1&condition=vintage');
  });
});
