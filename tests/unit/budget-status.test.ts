import { describe, expect, it } from 'vitest';
import { getBudgetStatus } from '@/lib/finance';

describe('getBudgetStatus', () => {
  it('aman bila < 80%', () => {
    expect(getBudgetStatus(79.9)).toBe('aman');
  });
  it('hampir-habis pada 80-100%', () => {
    expect(getBudgetStatus(80)).toBe('hampir-habis');
    expect(getBudgetStatus(100)).toBe('hampir-habis');
  });
  it('melebihi bila > 100%', () => {
    expect(getBudgetStatus(100.01)).toBe('melebihi');
  });
});
