import {
  corners,
  cylinder,
  haloOf,
  insetPlan,
  knurl,
  lineOnTop,
  pathOf,
  planOutline,
  pointsAt,
  radialTicks,
  ring,
  sideArc,
  sideSeam,
  slabOf,
  topTicks,
  type Flat,
  type Plan,
  type Point3,
  type SolidPaths,
} from '../../iso/iso-kit';
import {
  at,
  BASE,
  BASE_H,
  CHUTE,
  CHUTE_HALF,
  DRUM,
  DRUM_H,
  DRUM_R,
  DIAL,
  DIAL_H,
  DIAL_R,
  DIAL_TOP,
  DIAL_Z,
  FOOT_H,
  HOPPER,
  HOPPER_RIBS,
  HOPPER_THROAT,
  MAGAZINE,
  P,
  TRAY,
  WELL_RING,
  WELL_R,
  WELLS,
} from './view';

const solid = (plan: Plan, z: number, h: number, steps = 6, bevel = 0): SolidPaths =>
  slabOf(plan, z, h, P, steps, bevel);

const round = (
  cx: number,
  cy: number,
  r: number,
  z: number,
  h: number,
  steps = 40,
  bevel = 0,
): SolidPaths => cylinder(cx, cy, r, z, h, P, steps, bevel);

const line = (points: Point3[]) => pathOf(pointsAt(points, P));

const RAD = Math.PI / 180;

export interface Geometry {
  base: {
    halo: string;
    feet: SolidPaths[][];
    footScrews: Flat[];
    slab: SolidPaths;
    groove: string;
    screws: Flat[];
    screwRings: string;
    plate: SolidPaths;
    plateRules: string;
    plateScrews: Flat[];
    ruler: SolidPaths;
    ticks: { minor: string; major: string };
    rulerDots: Flat[];
  };
  hopper: {
    rings: SolidPaths[];
    throat: SolidPaths;
    pedestal: SolidPaths;
    pedestalBase: SolidPaths;
    pedestalBand: string;
    rim: string;
    seams: string;
    inner: string;
    bracket: SolidPaths;
    bracketLines: string;
    bracketScrews: Flat[];
  };
  chute: {
    surface: string;
    rails: string;
    ties: string;
    ends: Flat[];
    legLeft: SolidPaths;
    legRight: SolidPaths;
    legFeet: SolidPaths[];
  };
  drum: {
    body: SolidPaths;
    rim: string;
    hub: SolidPaths;
    hubRing: string;
    wellRings: string[];
    wellCentres: Flat[];
    knob: SolidPaths;
    knurl: string;
    gradient: string;
    tickMinor: string;
    tickMajor: string;
    arrows: SolidPaths[];
  };
  dial: {
    foot: SolidPaths;
    footScrews: Flat[];
    sleeve: SolidPaths;
    collar: SolidPaths;
    housing: SolidPaths;
    bezel: string;
    face: string;
    ticks: { minor: string; major: string };
    crown: SolidPaths;
    crownKnurl: string;
    needlePivot: Flat;
    needleTip: Flat;
    needleRest: string;
    labelY: number;
  };
  tray: {
    body: SolidPaths;
    inner: string;
    screws: Flat[];
    tip: Flat;
  };
}

function base() {
  const feet: SolidPaths[][] = [];
  for (const [x, y] of corners(BASE, 26)) {
    const pad = round(x, y, 9, -BASE_H - FOOT_H, 1.8, 24);
    const stem = round(x, y, 6.6, -BASE_H - FOOT_H + 1.8, FOOT_H - 1.8, 24);
    feet.push([pad, stem]);
  }

  const slab = solid(BASE, 0, BASE_H, 10, 1.6);
  const groove = planOutline(insetPlan(BASE, 6), 0, P, 10);
  const screwPts = corners(BASE, 13);
  const screwRings = screwPts.map(([x, y]) => ring(x, y, 2.6, 0, P, 18)).join('');
  const screws = pointsAt(
    screwPts.map(([x, y]) => [x, y, 0] as Point3),
    P,
  );

  const plate: Plan = { x: BASE.x + 26, y: BASE.y + BASE.d - 30, w: 118, d: 15, r: 2 };
  const plateRule1 = lineOnTop([plate.x + 5, plate.y + 5], [plate.x + plate.w - 5, plate.y + 5], 0.4, P);
  const plateRule2 = lineOnTop([plate.x + 5, plate.y + 8], [plate.x + 62, plate.y + 8], 0.4, P);
  const plateRule3 = lineOnTop([plate.x + 5, plate.y + 11], [plate.x + 40, plate.y + 11], 0.4, P);

  const ruler: Plan = { x: BASE.x + BASE.w - 190, y: BASE.y + BASE.d - 26, w: 164, d: 10, r: 1 };
  const ticks = topTicks(
    ruler.x + 6,
    ruler.x + ruler.w - 6,
    4,
    5,
    ruler.y + 1,
    0.5,
    [2.4, 4.6],
    P,
  );

  return {
    halo: haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P),
    feet,
    footScrews: pointsAt(
      corners(BASE, 26).map(([x, y]) => [x, y, -BASE_H - FOOT_H + FOOT_H] as Point3),
      P,
    ),
    slab,
    groove,
    screws,
    screwRings,
    plate: solid(plate, 0, 0.5, 3),
    plateRules: plateRule1 + plateRule2 + plateRule3,
    plateScrews: pointsAt(
      [
        [plate.x + 3, plate.y + 3, 0.5],
        [plate.x + plate.w - 3, plate.y + 3, 0.5],
      ] as Point3[],
      P,
    ),
    ruler: solid(ruler, 0, 0.5, 3),
    ticks,
    rulerDots: pointsAt(
      [
        [ruler.x + 1.5, ruler.y + ruler.d / 2, 0.5],
        [ruler.x + ruler.w - 1.5, ruler.y + ruler.d / 2, 0.5],
      ] as Point3[],
      P,
    ),
  };
}

function hopper(): Geometry['hopper'] {
  const rings = HOPPER_RIBS.map((rib) => round(HOPPER.x, HOPPER.y, rib.r, rib.z, rib.h, 48));
  const throat = round(HOPPER.x, HOPPER.y, HOPPER_THROAT, 26, 16, 32);
  // Kaki corong: tanpa ini corong melayang di atas alas.
  const pedestal = round(HOPPER.x, HOPPER.y, HOPPER_THROAT + 4, 0, 26, 32, 0.8);
  const pedestalBase = round(HOPPER.x, HOPPER.y, HOPPER_THROAT + 10, 0, 5, 36, 0.8);
  const pedestalBand = sideArc(HOPPER.x, HOPPER.y, HOPPER_THROAT + 4, 14, P, 24);

  const topRib = HOPPER_RIBS[HOPPER_RIBS.length - 1]!;
  const rim = ring(HOPPER.x, HOPPER.y, topRib.r - 2.4, topRib.z + topRib.h, P, 48);
  const inner = ring(HOPPER.x, HOPPER.y, topRib.r - 6, topRib.z + topRib.h, P, 48);

  // Garis sambungan tiap cangkang corong.
  const seams = HOPPER_RIBS.map((rib) =>
    sideArc(HOPPER.x, HOPPER.y, rib.r, rib.z + rib.h, P, 28),
  ).join('');

  const bracket: Plan = {
    x: HOPPER.x - 30,
    y: HOPPER.y + 26,
    w: 26,
    d: 16,
    r: 4,
  };

  return {
    rings,
    throat,
    pedestal,
    pedestalBase,
    pedestalBand,
    rim,
    inner,
    seams,
    bracket: solid(bracket, 0, 22, 5, 0.8),
    bracketLines: sideSeam(bracket, 12, P, 5),
    bracketScrews: pointsAt(
      [
        [bracket.x + 6, bracket.y + 8, 22],
        [bracket.x + bracket.w - 6, bracket.y + 8, 22],
      ] as Point3[],
      P,
    ),
  };
}

function chute(): Geometry['chute'] {
  // Dua rel sejajar mengikuti lintasan koin, dengan palang di antara keduanya.
  const left = CHUTE.map(([x, y, z]) => [x, y - CHUTE_HALF, z] as Point3);
  const right = CHUTE.map(([x, y, z]) => [x, y + CHUTE_HALF, z] as Point3);

  const ties: string[] = [];
  for (let i = 1; i < CHUTE.length; i++) {
    const [x, y, z] = CHUTE[i]!;
    ties.push(line([[x, y - CHUTE_HALF, z], [x, y + CHUTE_HALF, z]]));
  }

  // Dasar palung: satu quad per segmen, diisi warna kertas supaya talang
  // terbaca sebagai permukaan, bukan kawat.
  const surface = CHUTE.slice(0, -1)
    .map((_, i) => {
      const a = left[i]!;
      const b = left[i + 1]!;
      const c = right[i + 1]!;
      const d = right[i]!;
      return pathOf(pointsAt([a, b, c, d], P), true);
    })
    .join('');

  // Dua tiang penopang tepat di bawah lutut talang, agar talang tidak
  // melayang: setiap tiang berakhir di alas dan menyentuh rel.
  const legLeft = solid({ x: -60, y: -44, w: 10, d: 10, r: 3 }, 0, 28, 4, 0.5);
  const legRight = solid({ x: -6, y: -30, w: 10, d: 10, r: 3 }, 0, 26, 4, 0.5);

  return {
    surface,
    rails: line(left) + line(right),
    ties: ties.join(''),
    ends: pointsAt([left[0]!, right[0]!, left[left.length - 1]!, right[right.length - 1]!], P),
    legLeft,
    legRight,
    legFeet: [
      round(-54, -38, 7.5, 0, 1.5, 20),
      round(0, -24, 7.5, 0, 1.5, 20),
    ],
  };
}

function drum() {
  const body = round(DRUM.x, DRUM.y, DRUM_R, 0, DRUM_H, 64, 1.4);
  const rim = ring(DRUM.x, DRUM.y, DRUM_R - 3, DRUM_H, P, 64);
  const gradient = ring(DRUM.x, DRUM.y, DRUM_R - 9, DRUM_H, P, 64);

  const hub = round(DRUM.x, DRUM.y, 13, DRUM_H, 8, 32, 0.8);
  const hubRing = ring(DRUM.x, DRUM.y, 9, DRUM_H + 8, P, 32);

  // Lubang penyortir mengelilingi hub.
  const wellRings: string[] = [];
  const wellCentres: Flat[] = [];
  for (let i = 0; i < WELLS; i++) {
    const angle = (i / WELLS) * Math.PI * 2 - Math.PI / 2;
    const cx = DRUM.x + Math.cos(angle) * WELL_RING;
    const cy = DRUM.y + Math.sin(angle) * WELL_RING;
    wellRings.push(ring(cx, cy, WELL_R, DRUM_H, P, 24));
    wellRings.push(ring(cx, cy, WELL_R - 3.5, DRUM_H, P, 24));
    wellCentres.push(at([cx, cy, DRUM_H]));
  }

  const knob = round(DRUM.x, DRUM.y, 8, DRUM_H + 8, 7, 28, 1);
  const knobKnurl = knurl(DRUM.x, DRUM.y, 8, DRUM_H + 8, DRUM_H + 15, 16, P, 0.5);

  const ticks = radialTicks(DRUM.x, DRUM.y, DRUM_R - 5.5, 48, 4, DRUM_H, [1.6, 3.4], P);

  // Dua panah melingkar: arah putaran drum.
  const arrows: SolidPaths[] = [];
  for (const offset of [0, 180]) {
    const a = (offset + 92) * RAD;
    const cx = DRUM.x + Math.cos(a) * (DRUM_R + 3);
    const cy = DRUM.y + Math.sin(a) * (DRUM_R + 3);
    arrows.push(solid({ x: cx - 5, y: cy - 3, w: 10, d: 6, r: 2 }, 6, 3, 3, 0.4));
  }

  return {
    body,
    rim,
    hub,
    hubRing,
    wellRings,
    wellCentres,
    knob,
    knurl: knobKnurl,
    gradient,
    tickMinor: ticks.minor,
    tickMajor: ticks.major,
    arrows,
  };
}

function dial(): Geometry['dial'] {
  const foot: Plan = { x: DIAL.x - 20, y: DIAL.y - 18, w: 40, d: 36, r: 7 };
  const sleeve = round(DIAL.x, DIAL.y, 9, 0, DIAL_Z - 8, 36, 0.8);
  const collar = round(DIAL.x, DIAL.y, 14, DIAL_Z - 8, 8, 36, 1);
  const housing = round(DIAL.x, DIAL.y, DIAL_R, DIAL_Z, DIAL_H, 56, 1.2);

  const bezel = ring(DIAL.x, DIAL.y, DIAL_R - 2.4, DIAL_TOP, P, 56);
  const face = ring(DIAL.x, DIAL.y, DIAL_R - 7, DIAL_TOP, P, 56);

  const ticks = radialTicks(
    DIAL.x,
    DIAL.y,
    DIAL_R - 8,
    30,
    5,
    DIAL_TOP,
    [1.5, 3.2],
    P,
    -Math.PI * 0.75,
    Math.PI * 1.5,
  );

  const crown = round(DIAL.x, DIAL.y, 6, DIAL_TOP, 5, 24, 0.8);
  const crownKnurl = knurl(DIAL.x, DIAL.y, 6, DIAL_TOP, DIAL_TOP + 5, 12, P, 0.4);

  const needlePivot = at([DIAL.x, DIAL.y, DIAL_TOP + 5.4]);
  const needleTip = at([DIAL.x, DIAL.y, DIAL_TOP + 5.4]);
  const needleRest = line([[DIAL.x, DIAL.y, DIAL_TOP + 5.4], [DIAL.x + 12, DIAL.y - 4, DIAL_TOP + 5.4]]);

  return {
    foot: solid(foot, 0, 5, 5, 0.6),
    footScrews: pointsAt(
      [
        [foot.x + 6, foot.y + 6, 5],
        [foot.x + foot.w - 6, foot.y + 6, 5],
      ] as Point3[],
      P,
    ),
    sleeve,
    collar,
    housing,
    bezel,
    face,
    ticks,
    crown,
    crownKnurl,
    needlePivot,
    needleTip,
    needleRest,
    labelY: DIAL_TOP,
  };
}

function tray(): Geometry['tray'] {
  const body = solid(TRAY, 0, 7, 8, 0.9);
  const inner = planOutline(insetPlan(TRAY, 7), 7, P, 8);
  return {
    body,
    inner,
    screws: pointsAt(
      corners(TRAY, 12).map(([x, y]) => [x, y, 7] as Point3),
      P,
    ),
    tip: at([TRAY.x + TRAY.w / 2, TRAY.y + TRAY.d / 2, 7]),
  };
}

/** Majalah koin cadangan: tabung kecil berisi tumpukan koin. */
function magazine() {
  const body = solid(MAGAZINE, 0, 5, 6, 0.7);
  const lip = planOutline(insetPlan(MAGAZINE, 5), 5, P, 6);
  const cx = MAGAZINE.x + MAGAZINE.w / 2;
  const cy = MAGAZINE.y + MAGAZINE.d / 2;
  const stack = round(cx, cy, 11, 5, 16, 32, 0.6);
  const stackTop = ring(cx, cy, 8.5, 21, P, 32);
  const ridges = [8, 11.5, 15].map((z) => sideArc(cx, cy, 11, z, P, 24)).join('');
  return { body, lip, stack, stackTop, ridges, screws: pointsAt(corners(MAGAZINE, 8).map(([x, y]) => [x, y, 5] as Point3), P) };
}

/** Semua geometri statis. Dihitung sekali saat modul dimuat. */
export const GEO = {
  base: base(),
  hopper: hopper(),
  chute: chute(),
  drum: drum(),
  dial: dial(),
  tray: tray(),
  magazine: magazine(),
} satisfies Geometry & { magazine: ReturnType<typeof magazine> };
