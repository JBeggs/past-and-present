/**
 * Vitest setup for Past and Present
 */
import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  localStorage.clear();
});
