import { describe, expect, it } from 'vitest';
import { applyEffect, reverseEffect } from '@/lib/finance';

describe('efek saldo', () => {
  it('expense mengurangi, income menambah', () => {
    expect(applyEffect(100000, 'EXPENSE', 25000)).toBe(75000);
    expect(applyEffect(100000, 'INCOME', 25000)).toBe(125000);
  });
  it('reverse mengembalikan', () => {
    expect(reverseEffect(75000, 'EXPENSE', 25000)).toBe(100000);
    expect(reverseEffect(125000, 'INCOME', 25000)).toBe(100000);
  });
});
