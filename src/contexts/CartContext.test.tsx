/**
 * Unit tests for CartContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import * as api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  ecommerceApi: {
    cart: { get: vi.fn() },
  },
}));

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from './AuthContext';

function TestConsumer() {
  const { cart, itemCount, loading, refreshCart } = useCart();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="cart">{cart ? 'has-cart' : 'no-cart'}</span>
      <button data-testid="refresh" onClick={() => refreshCart()} />
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: '1' } });
  });

  it('provides useCart hook', async () => {
    (api.ecommerceApi.cart.get as any).mockResolvedValue({
      items: [],
      id: 'cart-1',
    });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });
  });

  it('loads cart when user is logged in', async () => {
    (api.ecommerceApi.cart.get as any).mockResolvedValue({
      id: 'cart-1',
      items: [
        { id: 'item-1', quantity: 2, product: { name: 'Product A' } },
        { id: 'item-2', quantity: 1, product: { name: 'Product B' } },
      ],
    });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('cart')).toHaveTextContent('has-cart');
    expect(screen.getByTestId('item-count')).toHaveTextContent('3');
  });

  it('returns null cart when user is not logged in', async () => {
    (useAuth as any).mockReturnValue({ user: null });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('cart')).toHaveTextContent('no-cart');
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('refreshCart updates cart', async () => {
    (api.ecommerceApi.cart.get as any)
      .mockResolvedValueOnce({ id: 'cart-1', items: [] })
      .mockResolvedValueOnce({
        id: 'cart-1',
        items: [{ id: 'item-1', quantity: 2, product: { name: 'Product A' } }],
      });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    await waitFor(() => {
      screen.getByTestId('refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    });
  });

  it('useCart throws when used outside CartProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useCart must be used within a CartProvider');
    consoleSpy.mockRestore();
  });
});
