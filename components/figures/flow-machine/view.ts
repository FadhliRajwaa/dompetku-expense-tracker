import {
  boxCorners,
  fitProjection,
  iso,
  type Plan,
  type Point3,
  type Projection,
} from '../../iso/iso-kit';

/* ============================================================================
   Mesin alur uang — "DompetKu coin sorter"

   Objeknya: mesin penghitung dan penyortir koin. Koin masuk lewat corong di
   kiri, menggelinding menuruni talang, dicacah ke dalam drum penyortir, dan
   jarum di kanan mencatat totalnya. Itulah alur uang pribadi: uang masuk,
   dibagi per kategori, lalu dihitung sebagai saldo.

   Semua satuan dunia kira-kira 1 px objek aslinya. x dan y di lantai, z ke atas.
   ========================================================================== */

export const WIDTH = 780;
// Lebar/tinggi dipilih dari bbox mesin: alasnya lebar dan rendah, jadi kotak
// yang terlalu tinggi menyisakan ruang kosong besar di bawah gambar.
export const HEIGHT = 420;

/** Alas mesin. Sisi atasnya di z = 0; alas menggantung di bawahnya. */
export const BASE: Plan = { x: -140, y: -100, w: 274, d: 166, r: 11 };
export const BASE_H = 13;
export const FOOT_H = 7;

/** Corong tempat koin masuk. */
export const HOPPER = { x: -98, y: -52 } as const;
export const HOPPER_FLOOR = 40;
export const HOPPER_THROAT = 16;
export const HOPPER_RIBS = [
  { r: 18, z: 34, h: 11 },
  { r: 25, z: 45, h: 12 },
  { r: 33, z: 57, h: 12 },
  { r: 41, z: 69, h: 13 },
] as const;
export const HOPPER_TOP = 82;

/** Drum penyortir. */
export const DRUM = { x: 34, y: -20 } as const;
export const DRUM_R = 52;
export const DRUM_H = 30;
export const DRUM_TOP = DRUM_H;
export const WELL_R = 11.5;
export const WELLS = 6;
export const WELL_RING = 31;

/** Dial penghitung di kanan. */
export const DIAL = { x: 122, y: -34 } as const;
export const DIAL_R = 23;
export const DIAL_Z = 62;
export const DIAL_H = 14;
export const DIAL_TOP = DIAL_Z + DIAL_H;

/** Talang: lintasan koin dari corong ke drum. */
export const CHUTE: Point3[] = [
  [-86, -48, 52],
  [-72, -44, 46],
  [-50, -38, 40],
  [-12, -28, 36],
  [28, -20, 36],
];

/** Lebar setengah talang (rel kiri/kanan). */
export const CHUTE_HALF = 4.5;

/** Baki penampung di depan-kanan drum. */
export const TRAY: Plan = { x: 44, y: 34, w: 100, d: 36, r: 7 };

/** Majalah koin cadangan di depan-kiri. */
export const MAGAZINE: Plan = { x: -124, y: 22, w: 54, d: 34, r: 6 };

export const COIN_R = 7.4;
export const COIN_H = 2.8;

export const P: Projection = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [HOPPER.x, HOPPER.y, HOPPER_TOP + 4],
    [DIAL.x + DIAL_R, DIAL.y, DIAL_TOP + 10],
  ],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: 45 },
);

export const at = (point: Point3) => iso(point, P);
