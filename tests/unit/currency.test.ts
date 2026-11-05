import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/lib/currency';

describe('formatMoney', () => {
  it('IDR tanpa desimal dengan simbol Rp', () => {
    expect(formatMoney(1500000, 'IDR')).toBe('Rp 1.500.000');
  });
  it('IDR nol', () => {
    expect(formatMoney(0, 'IDR')).toBe('Rp 0');
  });
  it('USD memakai dua desimal', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$ 1,234.50');
  });
  it('EUR memakai format Jerman', () => {
    expect(formatMoney(1234.5, 'EUR')).toBe('€ 1.234,50');
  });
  it('nilai negatif memakai tanda minus tipografis', () => {
    expect(formatMoney(-45000, 'IDR')).toBe('−Rp 45.000');
  });
  it('mata uang tidak dikenal jatuh ke IDR', () => {
    expect(formatMoney(1000, 'XYZ')).toBe('Rp 1.000');
  });
});
