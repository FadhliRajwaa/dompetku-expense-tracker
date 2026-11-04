import { describe, expect, it } from 'vitest';
import { validateTransfer } from '@/lib/finance';

describe('validateTransfer', () => {
  it('tolak dompet sama', () => {
    expect(validateTransfer({ from: 'a', to: 'a', amount: 1000, balance: 5000 }).ok).toBe(false);
  });
  it('tolak saldo kurang', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 6000, balance: 5000 }).ok).toBe(false);
  });
  it('tolak amount <= 0', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 0, balance: 5000 }).ok).toBe(false);
  });
  it('terima transfer valid', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 1000, balance: 5000 }).ok).toBe(true);
  });
});
