import { describe, expect, it } from 'vitest';
import { toCSV } from '@/lib/csv';

describe('toCSV', () => {
  it('header + escape koma/kutip', () => {
    const out = toCSV([{ tanggal: '2026-11-01', catatan: 'Kopi, "spesial"', nominal: 20000 }]);
    expect(out.split('\n')[0]).toBe('tanggal,catatan,nominal');
    expect(out).toContain('"Kopi, ""spesial"""');
  });
  it('baris kosong menghasilkan string kosong', () => {
    expect(toCSV([])).toBe('');
  });
});
