/**
 * API Client unit tests for Past and Present
 */
import { describe, it, expect } from 'vitest';
import { ApiClient, ApiError } from './api';

describe('ApiError', () => {
  it('can be created with message', () => {
    const err: ApiError = { message: 'Test error' };
    expect(err.message).toBe('Test error');
  });

  it('can include optional fields', () => {
    const err: ApiError = {
      message: 'Not found',
      status: 404,
      code: 'NOT_FOUND',
    };
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });
});

describe('ApiClient', () => {
  it('can be instantiated with custom base URL', () => {
    const client = new ApiClient('https://example.com/api');
    expect(client).toBeDefined();
  });

  it('can be instantiated with default base URL', () => {
    const client = new ApiClient();
    expect(client).toBeDefined();
  });
});
