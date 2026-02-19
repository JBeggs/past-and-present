/**
 * API Client unit tests for Past and Present
 * Uses mocked fetch; aligns with Django API response shapes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, apiClient, ecommerceApi } from './api';

const API_BASE = 'http://localhost:8000/api';
const COMPANY_SLUG = 'past-and-present';

function createMockResponse(body: any, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    url: `${API_BASE}/auth/login/`,
    headers: {
      get: (name: string) => (name === 'content-type' ? 'application/json' : null),
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('authApi', () => {
  beforeEach(() => {
    authApi.logout();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('POSTs to /auth/login/ with username, password, company_slug', async () => {
      const mockResponse = {
        access: 'new-access',
        refresh: 'new-refresh',
        user: { id: '1', username: 'testuser' },
        company: { id: 'company-1', name: 'Past and Present' },
      };
      const fetchMock = vi.fn().mockResolvedValue(createMockResponse(mockResponse));
      vi.stubGlobal('fetch', fetchMock);

      const result = await authApi.login('testuser', 'testpass');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/login/`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
            company_slug: COMPANY_SLUG,
          }),
        })
      );
      expect(result.access).toBe('new-access');
      expect(result.refresh).toBe('new-refresh');
      expect(apiClient.getToken()).toBe('new-access');
      expect(apiClient.getRefreshToken()).toBe('new-refresh');
      expect(apiClient.getCompanyId()).toBe('company-1');
    });

    it('throws on non-200 response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        createMockResponse({ error: 'Invalid credentials' }, false)
      ));

      await expect(authApi.login('bad', 'bad')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('POSTs to /auth/register/ and sets tokens.access, tokens.refresh, company.id', async () => {
      const mockResponse = {
        tokens: { access: 'reg-access', refresh: 'reg-refresh' },
        user: { id: '2', email: 'new@test.com' },
        company: { id: 'company-1', name: 'Past and Present' },
      };
      const fetchMock = vi.fn().mockResolvedValue(createMockResponse(mockResponse));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.register({
        email: 'new@test.com',
        password: 'pass123',
        password_confirm: 'pass123',
        full_name: 'Test User',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/auth/register/`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"email":"new@test.com"'),
        })
      );
      expect(apiClient.getToken()).toBe('reg-access');
      expect(apiClient.getRefreshToken()).toBe('reg-refresh');
      expect(apiClient.getCompanyId()).toBe('company-1');
    });
  });

  describe('logout', () => {
    it('clears token, refresh token, and company id', async () => {
      const mockResponse = {
        access: 'tok',
        refresh: 'ref',
        user: {},
        company: { id: 'c1' },
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createMockResponse(mockResponse)));

      await authApi.login('u', 'p');
      expect(apiClient.getToken()).toBeTruthy();
      authApi.logout();
      expect(apiClient.getToken()).toBeNull();
      expect(apiClient.getRefreshToken()).toBeNull();
      expect(apiClient.getCompanyId()).toBeNull();
    });
  });
});

describe('apiClient', () => {
  beforeEach(() => {
    authApi.logout();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('request headers', () => {
    it('adds Authorization Bearer and X-Company-Id when authenticated', async () => {
      const loginResponse = {
        access: 'my-token',
        refresh: 'my-refresh',
        user: {},
        company: { id: 'company-123' },
      };
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(createMockResponse(loginResponse))
        .mockResolvedValueOnce(createMockResponse({ data: [] }));
      vi.stubGlobal('fetch', fetchMock);

      await authApi.login('u', 'p');
      await apiClient.get('/v1/products/');

      const getCall = fetchMock.mock.calls.find((c: [string, RequestInit]) =>
        c[0].includes('/v1/products/')
      );
      expect(getCall).toBeDefined();
      expect(getCall[1].headers).toMatchObject(
        expect.objectContaining({
          Authorization: 'Bearer my-token',
          'X-Company-Id': 'company-123',
        })
      );
    });
  });
});

describe('ecommerceApi', () => {
  beforeEach(() => {
    authApi.logout();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const loginAndGetFetchMock = async () => {
    const loginResponse = {
      access: 'test-token',
      refresh: 'test-refresh',
      user: {},
      company: { id: 'company-1' },
    };
    const fetchMock = vi.fn().mockResolvedValue(createMockResponse(loginResponse));
    vi.stubGlobal('fetch', fetchMock);
    await authApi.login('u', 'p');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(createMockResponse({}));
    return fetchMock;
  };

  describe('products', () => {
    it('list() GETs public products with company slug', async () => {
      const fetchMock = await loginAndGetFetchMock();
      fetchMock.mockResolvedValue(createMockResponse({ results: [] }));

      await ecommerceApi.products.list();

      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/v1/public/past-and-present/products/');
      expect(call[1].method).toBe('GET');
    });
  });

  describe('cart', () => {
    it('get() GETs cart', async () => {
      const fetchMock = await loginAndGetFetchMock();
      fetchMock.mockResolvedValue(createMockResponse({ items: [] }));

      await ecommerceApi.cart.get();

      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/v1/carts/');
      expect(call[1].method).toBe('GET');
    });

    it('addItem() POSTs product_id and quantity', async () => {
      const fetchMock = await loginAndGetFetchMock();
      fetchMock.mockResolvedValue(createMockResponse({ success: true }));

      await ecommerceApi.cart.addItem('prod-123', 2);

      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/v1/carts/items/');
      expect(call[1].method).toBe('POST');
      expect(JSON.parse(call[1].body as string)).toEqual({ product_id: 'prod-123', quantity: 2 });
    });
  });

  describe('orders', () => {
    it('createShipment() POSTs to create-shipment (Courier Guy)', async () => {
      const fetchMock = await loginAndGetFetchMock();
      fetchMock.mockResolvedValue(createMockResponse({ success: true, data: { waybillNumber: 'TCG123' } }));

      await ecommerceApi.orders.createShipment('order-uuid-123');

      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/v1/orders/order-uuid-123/create-shipment/');
      expect(call[1].method).toBe('POST');
    });
  });

  describe('payments', () => {
    it('createCheckout() POSTs to Yoco checkout', async () => {
      const fetchMock = await loginAndGetFetchMock();
      fetchMock.mockResolvedValue(createMockResponse({ checkoutId: 'chk_123', redirectUrl: 'https://yoco.com/checkout' }));

      await ecommerceApi.payments.createCheckout('order-uuid-456');

      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/v1/payments/yoco/checkout/');
      expect(call[1].method).toBe('POST');
      expect(JSON.parse(call[1].body as string)).toMatchObject({ order_id: 'order-uuid-456' });
    });
  });
});
