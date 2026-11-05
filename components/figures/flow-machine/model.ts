import { CHUTE } from './view';

/**
 * Model mesin alur uang — satu sumber angka untuk gambar dan keterangan.
 *
 * Yang bergerak: koin turun dari corong, menggelinding di talang, lalu masuk
 * ke lubang drum. Drum berputar satu langkah setiap koin masuk, dan jarum
 * dial mencatat berapa slot yang sudah terisi. Semua angka readout dihitung
 * dari siklus yang sama yang menggerakkan gambarnya.
 */

/** Koin per siklus — satu per lubang drum. */
export const COINS_PER_CYCLE = 6;

/** Lama satu siklus penuh (detik). */
export const CYCLE_SECONDS = 9.6;

/** Bagian fase yang dipakai koin untuk turun dan menggelinding. */
const DROP_FRACTION = 0.62;

/** Nilai tiap koin dalam rupiah. */
export const COIN_VALUE = 25_000;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
};

export interface CoinPose {
  x: number;
  y: number;
  z: number;
  /** Koin mengecil saat menjauh, memberi kesan turun. */
  scale: number;
}

/**
 * Posisi satu koin pada saat `now`, atau `null` bila koin sudah di dalam drum.
 *
 * Fase 0–DROP_FRACTION: turun dari corong lalu menggelinding di talang.
 * Setelah itu koin dianggap sudah masuk lubang dan tidak digambar.
 */
export function coinAt(now: number, index: number): CoinPose | null {
  const phase = ((now / CYCLE_SECONDS + index / COINS_PER_CYCLE) % 1 + 1) % 1;
  if (phase >= DROP_FRACTION) return null;

  const t = phase / DROP_FRACTION;

  // 0–16%: jatuh hampir lurus dari mulut corong.
  if (t < 0.16) {
    const k = smooth(t / 0.16);
    const [sx, sy, sz] = CHUTE[0]!;
    return { x: sx, y: sy, z: sz - 24 * k, scale: 1 - 0.2 * k };
  }

  // Sisanya: menggelinding menuruni talang.
  const k = smooth((t - 0.16) / 0.84);
  const last = CHUTE.length - 1;
  const pos = k * last;
  const i = Math.min(last - 1, Math.floor(pos));
  const f = pos - i;
  const a = CHUTE[i]!;
  const b = CHUTE[i + 1]!;

  return {
    x: a[0] + (b[0] - a[0]) * f,
    y: a[1] + (b[1] - a[1]) * f,
    z: a[2] + (b[2] - a[2]) * f,
    scale: 0.8 - 0.2 * f,
  };
}

/** Sudut putar drum (radian) pada saat `now`. */
export function drumAngle(now: number) {
  return (now / CYCLE_SECONDS) * Math.PI * 2;
}

/** Jumlah slot yang sudah terisi pada siklus berjalan. */
export function filledSlots(now: number) {
  const cycle = (now / CYCLE_SECONDS) % 1;
  return Math.floor(cycle * COINS_PER_CYCLE);
}

/** Sudut jarum dial, derajat. Jarum menyapu dan berhenti di slot berikutnya. */
export function needleAngle(now: number) {
  const span = 120;
  const cycle = (now / CYCLE_SECONDS) % 1;
  const stepped = Math.floor(cycle * COINS_PER_CYCLE) / COINS_PER_CYCLE;
  const within = (cycle * COINS_PER_CYCLE) % 1;
  // Bergerak cepat di awal slot, lalu diam — seperti jarum yang tersentak.
  const travel = smooth(Math.min(1, within / 0.18));
  return -span / 2 + (stepped + travel / COINS_PER_CYCLE) * span;
}

/** Teks readout di sudut kartu. */
export function readoutText(now: number) {
  const filled = filledSlots(now);
  const total = new Intl.NumberFormat('id-ID').format(filled * COIN_VALUE);
  return `Rp ${total} · ${filled} / ${COINS_PER_CYCLE} slot`;
}
