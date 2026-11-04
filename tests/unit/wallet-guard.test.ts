import { describe, expect, it } from 'vitest';
import { canArchiveWallet } from '@/lib/finance';

describe('canArchiveWallet', () => {
  it('boleh arsip walau ada transaksi', () => {
    expect(canArchiveWallet({ txCount: 5 })).toEqual({ ok: true });
  });
  it('boleh arsip walau dompet terakhir (warning di UI)', () => {
    expect(canArchiveWallet({ txCount: 0 })).toEqual({ ok: true });
  });
});
