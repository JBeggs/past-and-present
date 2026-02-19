/**
 * Component tests for PudoLocationSelector
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PudoLocationSelector } from './PudoLocationSelector';
import { ecommerceApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  ecommerceApi: {
    pudo: { locations: vi.fn() },
  },
}));

describe('PudoLocationSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ecommerceApi.pudo.locations).mockResolvedValue([]);
  });

  it('renders search input and button', () => {
    render(<PudoLocationSelector selectedLocation={null} onSelect={mockOnSelect} />);
    expect(screen.getByText(/Search for Pudo Pickup Point/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter suburb or postal code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('search button is disabled when search is empty', () => {
    render(<PudoLocationSelector selectedLocation={null} onSelect={mockOnSelect} />);
    expect(screen.getByRole('button', { name: /Search/i })).toBeDisabled();
  });

  it('calls API and shows results when search succeeds', async () => {
    vi.mocked(ecommerceApi.pudo.locations).mockResolvedValue([
      { id: 'loc-1', name: 'Store A', address: '123 Main St', city: 'Cape Town' },
    ]);
    render(<PudoLocationSelector selectedLocation={null} onSelect={mockOnSelect} />);
    fireEvent.change(screen.getByPlaceholderText(/Enter suburb or postal code/i), {
      target: { value: 'Cape Town' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => {
      expect(screen.getByText('Store A')).toBeInTheDocument();
    });
  });

  it('calls onSelect when location clicked', async () => {
    const loc = { id: 'loc-1', name: 'Store A', address: '123 Main St', city: 'Cape Town' };
    vi.mocked(ecommerceApi.pudo.locations).mockResolvedValue([loc]);
    render(<PudoLocationSelector selectedLocation={null} onSelect={mockOnSelect} />);
    fireEvent.change(screen.getByPlaceholderText(/Enter suburb or postal code/i), {
      target: { value: 'Cape Town' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => {
      expect(screen.getByText('Store A')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Store A'));
    expect(mockOnSelect).toHaveBeenCalledWith(loc);
  });

  it('shows selected location when provided', () => {
    const loc = { id: 'loc-1', name: 'Store A', address: '123 Main St', city: 'Cape Town' };
    render(<PudoLocationSelector selectedLocation={loc} onSelect={mockOnSelect} />);
    expect(screen.getByText('Selected pickup point')).toBeInTheDocument();
    expect(screen.getByText('Store A')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('calls onSelect(null) when Change clicked', () => {
    const loc = { id: 'loc-1', name: 'Store A', address: '123 Main St', city: 'Cape Town' };
    render(<PudoLocationSelector selectedLocation={loc} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText('Change'));
    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });
});
