import { describe, expect, it } from 'vitest';
import { formatIDR } from '@/lib/format';

describe('formatIDR', () => {
  it('format ribuan Indonesia', () => {
    expect(formatIDR(1500000)).toBe('Rp 1.500.000');
  });
  it('nol', () => {
    expect(formatIDR(0)).toBe('Rp 0');
  });
  it('negatif tetap tampil', () => {
    expect(formatIDR(-45000)).toBe('-Rp 45.000');
  });
});
