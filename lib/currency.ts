import { db } from './db';

/** Mata uang yang didukung. IDR adalah mata uang dasar (base). */
export const SUPPORTED_CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_META: Record<CurrencyCode, { label: string; symbol: string; locale: string }> = {
  IDR: { label: 'Rupiah Indonesia', symbol: 'Rp', locale: 'id-ID' },
  USD: { label: 'Dolar Amerika', symbol: '$', locale: 'en-US' },
  EUR: { label: 'Euro', symbol: '€', locale: 'de-DE' },
  SGD: { label: 'Dolar Singapura', symbol: 'S$', locale: 'en-SG' },
  MYR: { label: 'Ringgit Malaysia', symbol: 'RM', locale: 'ms-MY' },
};

/**
 * Kurs cadangan bila tabel FxRate kosong. Nilai ini HANYA untuk mencegah
 * pembagian nol — bukan angka otoritatif. Sumber sebenarnya: tabel FxRate.
 */
const FALLBACK_TO_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 16_000,
  EUR: 17_500,
  SGD: 12_000,
  MYR: 3_600,
};

/** Ambil kurs 1 unit `currency` dalam IDR. */
export async function getRateToIdr(currency: string): Promise<number> {
  const code = currency.toUpperCase() as CurrencyCode;
  if (code === 'IDR') return 1;
  try {
    const row = await db.fxRate.findUnique({ where: { currency: code } });
    const rate = row ? Number(row.rateToIdr) : 0;
    if (Number.isFinite(rate) && rate > 0) return rate;
  } catch {
    // DB tidak tersedia / tabel belum ada — pakai cadangan.
  }
  return FALLBACK_TO_IDR[code] ?? 1;
}

/** Semua kurs sekaligus untuk dropdown dan konversi massal. */
export async function getRates(): Promise<Record<CurrencyCode, number>> {
  const rows = await db.fxRate.findMany().catch(() => []);
  const map = { ...FALLBACK_TO_IDR } as Record<CurrencyCode, number>;
  for (const r of rows) {
    const code = r.currency.toUpperCase() as CurrencyCode;
    const v = Number(r.rateToIdr);
    if (code in map && Number.isFinite(v) && v > 0) map[code] = v;
  }
  return map;
}

/** Ubah nominal dari satu mata uang ke IDR. */
export async function toIdr(amount: number, currency: string): Promise<number> {
  if (!Number.isFinite(amount)) return 0;
  const rate = await getRateToIdr(currency);
  return amount * rate;
}

/** Format nominal memakai simbol & lokal mata uangnya. */
export function formatMoney(amount: number, currency = 'IDR'): string {
  const raw = currency.toUpperCase() as CurrencyCode;
  // Mata uang tak dikenal harus jatuh ke IDR sepenuhnya — termasuk jumlah
  // desimalnya, bukan hanya simbol & lokalnya.
  const code: CurrencyCode = raw in CURRENCY_META ? raw : 'IDR';
  const meta = CURRENCY_META[code];
  const abs = Math.abs(amount);
  const digits = code === 'IDR' ? 0 : 2;
  const formatted = new Intl.NumberFormat(meta.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(abs);
  const sign = amount < 0 && abs !== 0 ? '−' : '';
  return `${sign}${meta.symbol} ${formatted}`;
}

/**
 * Konversi nilai `amount` (dalam `from`) ke `to` memakai kurs terhadap IDR.
 * Dipakai saat menampilkan nominal lintas mata uang di satu total.
 */
export async function convert(amount: number, from: string, to: string, rates?: Record<CurrencyCode, number>) {
  const r = rates ?? (await getRates());
  const f = rates_req(r, from);
  const t = rates_req(r, to);
  if (f <= 0 || t <= 0) return amount;
  return (amount * f) / t;
}

function rates_req(rates: Record<CurrencyCode, number>, code: string) {
  return rates[(code.toUpperCase() as CurrencyCode) ?? 'IDR'] ?? 1;
}
