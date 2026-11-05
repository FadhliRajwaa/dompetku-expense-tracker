import { describe, expect, it } from 'vitest';
import { nextDate, describeRule } from '@/lib/recurring';

describe('nextDate', () => {
  it('harian menambah 1 hari', () => {
    expect(nextDate(new Date(2026, 0, 15), 'DAILY').getDate()).toBe(16);
  });

  it('harian dengan interval 3 menambah 3 hari', () => {
    expect(nextDate(new Date(2026, 0, 15), 'DAILY', 3).getDate()).toBe(18);
  });

  it('mingguan menambah 7 hari', () => {
    const d = nextDate(new Date(2026, 0, 15), 'WEEKLY');
    expect(d.getDate()).toBe(22);
  });

  it('bulanan mempertahankan tanggal', () => {
    const d = nextDate(new Date(2026, 0, 15), 'MONTHLY');
    expect(d.getMonth()).toBe(1); // Februari
    expect(d.getDate()).toBe(15);
  });

  it('bulanan mengunci ke akhir bulan bila tanggal tidak ada (31 Jan -> 28 Feb)', () => {
    const d = nextDate(new Date(2026, 0, 31), 'MONTHLY');
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(28); // 2026 bukan kabisat
  });

  it('bulanan tidak meluap ke bulan berikutnya (31 Mar -> 30 Apr)', () => {
    const d = nextDate(new Date(2026, 2, 31), 'MONTHLY');
    expect(d.getMonth()).toBe(3);
    expect(d.getDate()).toBe(30);
  });

  it('tahunan menambah 1 tahun', () => {
    const d = nextDate(new Date(2026, 5, 10), 'YEARLY');
    expect(d.getFullYear()).toBe(2027);
    expect(d.getDate()).toBe(10);
  });

  it('29 Feb -> 28 Feb tahun berikutnya (non-kabisat)', () => {
    const d = nextDate(new Date(2028, 1, 29), 'YEARLY');
    expect(d.getFullYear()).toBe(2029);
    expect(d.getDate()).toBe(28);
  });

  it('interval 0 atau negatif diperlakukan sebagai 1', () => {
    const a = nextDate(new Date(2026, 0, 15), 'DAILY', 0);
    expect(a.getDate()).toBe(16);
  });

  it('tidak memodifikasi tanggal asal', () => {
    const base = new Date(2026, 0, 15);
    nextDate(base, 'MONTHLY');
    expect(base.getMonth()).toBe(0);
    expect(base.getDate()).toBe(15);
  });
});

describe('describeRule', () => {
  it('interval 1 memakai nama tunggal', () => {
    expect(describeRule('MONTHLY', 1)).toBe('Bulanan');
  });
  it('interval > 1 menyebut angka', () => {
    expect(describeRule('WEEKLY', 2)).toBe('Tiap 2 minggu');
  });
});
