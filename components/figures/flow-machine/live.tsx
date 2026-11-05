'use client';

import * as React from 'react';
import { IsoFigure, Solid, Line, Dots } from '@/components/iso/react/draw';
import { useLoop, useReadout } from '@/components/iso/react/live';
import {
  circleRing,
  cylinder,
  pathOf,
  pointsAt,
  type Point3,
  type SolidPaths,
} from '@/components/iso/iso-kit';
import { GEO } from './geometry';
import { coinAt, drumAngle, needleAngle, readoutText } from './model';
import { at, COIN_H, COIN_R, DRUM, DRUM_H, DIAL, DIAL_TOP, HEIGHT, P, WELL_RING, WELL_R, WELLS, WIDTH } from './view';
// Urutan penting: iso.css mendefinisikan semua kelas dasar (.iso-solid,
// .iso-shade, .iso-line, …); figure.css menimpanya dengan palet DompetKu.
// Tanpa iso.css, seluruh path SVG tampil hitam karena tidak ada `fill`.
import '@/components/iso/iso.css';
import './figure.css';

const NEEDLE_R = 15;

/** Koin dibangun ulang tiap frame karena posisinya berubah. */
function coinSolid(x: number, y: number, z: number, scale: number): SolidPaths {
  return cylinder(x, y, r(scale), z, COIN_H * scale, P, 20, 0.4);
}

const r = (scale: number) => COIN_R * scale;

/** Cincin lubang drum mengikuti sudut putar drum. */
function wellPaths(angle: number) {
  const outer: string[] = [];
  const inner: string[] = [];
  const centres: Array<[number, number]> = [];

  for (let i = 0; i < WELLS; i++) {
    const a = angle + (i / WELLS) * Math.PI * 2;
    const cx = DRUM.x + Math.cos(a) * WELL_RING;
    const cy = DRUM.y + Math.sin(a) * WELL_RING;
    const project = (radius: number) =>
      pathOf(
        pointsAt(
          circleRing(cx, cy, radius, 20).map(([px, py]) => [px, py, DRUM_H] as Point3),
          P,
        ),
        true,
      );
    outer.push(project(WELL_R));
    inner.push(project(WELL_R - 3.5));
    centres.push(at([cx, cy, DRUM_H]));
  }

  return { outer, inner, centres };
}

export function FlowMachineLive() {
  const { anchor, say } = useReadout<HTMLDivElement>();

  const drumRings = React.useRef<SVGGElement | null>(null);
  const drumDots = React.useRef<SVGGElement | null>(null);
  const needle = React.useRef<SVGPathElement | null>(null);
  // Satu array ref untuk ketiga koin. Objek ref-nya stabil seumur komponen,
  // jadi callback gambar tidak dibuat ulang hanya karena array ini.
  const coinNodes = React.useRef<Array<SVGGElement | null>>([null, null, null]);

  const clock = React.useRef(1.4);
  const started = React.useRef(false);

  const paint = React.useCallback(
    (now: number) => {
      const rings = wellPaths(drumAngle(now));

      if (drumRings.current) {
        drumRings.current.innerHTML = rings.outer
          .map((d) => `<path class="iso-line" data-tone="lo" d="${d}"/>`)
          .concat(rings.inner.map((d) => `<path class="iso-line" data-tone="faint" d="${d}"/>`))
          .join('');
      }
      if (drumDots.current) {
        drumDots.current.innerHTML = rings.centres
          .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1"/>`)
          .join('');
      }

      if (needle.current) {
        const deg = needleAngle(now);
        const rad = ((deg - 90) * Math.PI) / 180;
        const pivot = at([DIAL.x, DIAL.y, DIAL_TOP + 5.2]);
        const tip = at([
          DIAL.x + Math.cos(rad) * NEEDLE_R,
          DIAL.y + Math.sin(rad) * NEEDLE_R,
          DIAL_TOP + 5.2,
        ]);
        needle.current.setAttribute('d', pathOf([pivot, tip]));
      }

      coinNodes.current.forEach((node, index) => {
        if (!node) return;
        const pose = coinAt(now, index);
        if (!pose) {
          node.style.opacity = '0';
          return;
        }
        const solid = coinSolid(pose.x, pose.y, pose.z, pose.scale);
        node.style.opacity = '1';
        node.querySelector('.coin-fill')?.setAttribute('d', solid.fill);
        node.querySelector('.coin-top')?.setAttribute('d', solid.top);
        node.querySelector('.coin-edge')?.setAttribute('d', solid.outline);
      });

      say(readoutText(now));
    },
    [say],
  );

  // Loop berhenti total saat kartu keluar layar.
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(Boolean(entries.at(-1)?.isIntersecting)),
      { rootMargin: '160px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [anchor]);

  useLoop((dt, calm) => {
    if (!started.current) {
      started.current = true;
      clock.current = calm ? 1.4 : 0;
    }
    if (!calm) clock.current += dt;
    paint(clock.current);
    return !calm;
  }, visible);

  // Pose diam digambar sekali saat hidrasi; angka readout langsung benar.
  React.useEffect(() => {
    paint(clock.current);
  }, [paint]);

  return (
    // Kelas `iso flow-machine` WAJIB di pembungkus: token warna anatomi
    // dideklarasikan di `.flow-machine.iso`, dan tanpa `data-theme` kartu akan
    // memakai palet gelap default kit di mode terang.
    <div ref={anchor} className="iso flow-machine" data-theme="light">
      <IsoFigure
        width={WIDTH}
        height={HEIGHT}
        label="Mesin alur uang DompetKu: corong tempat koin masuk, talang tempat koin menggelinding, drum penyortir enam lubang yang berputar, dan dial penghitung di sebelah kanan yang mencatat total."
      >
        {/* Bayangan */}
        <path className="iso-halo" d={GEO.base.halo} />

        {/* Kaki alas */}
        {GEO.base.feet.map((pair, i) => (
          <g key={i}>
            {pair.map((paths, j) => (
              <Solid key={j} paths={paths} tone={j === 0 ? 'lo' : 'mid'} crease="faint" />
            ))}
          </g>
        ))}

        <Solid paths={GEO.base.slab} tone="mid" crease="faint" />
        <Line d={GEO.base.groove} tone="lo" />
        <Line d={GEO.base.screwRings} tone="lo" />
        <Dots points={GEO.base.screws} size={0.5} tone="mid" />

        {/* Plat nama + penggaris */}
        <Solid paths={GEO.base.plate} tone="lo" crease="none" />
        <Line d={GEO.base.plateRules} tone="faint" />
        <Dots points={GEO.base.plateScrews} size={0.4} tone="mid" />
        <Solid paths={GEO.base.ruler} tone="lo" crease="none" />
        <Line d={GEO.base.ticks.minor} tone="lo" />
        <Line d={GEO.base.ticks.major} tone="mid" />
        <Dots points={GEO.base.rulerDots} size={0.4} tone="mid" />

        {/* Baki penampung */}
        <Solid paths={GEO.tray.body} tone="mid" crease="faint" />
        <Line d={GEO.tray.inner} tone="lo" />
        <Dots points={GEO.tray.screws} size={0.4} tone="mid" />

        {/* Corong */}
        <Solid paths={GEO.hopper.bracket} tone="lo" crease="faint" />
        <Line d={GEO.hopper.bracketLines} tone="faint" />
        <Dots points={GEO.hopper.bracketScrews} size={0.4} tone="mid" />
        {GEO.hopper.rings.map((paths, i) => (
          <Solid key={i} paths={paths} tone={i % 2 === 0 ? 'mid' : 'hi'} crease="faint" />
        ))}
        <Solid paths={GEO.hopper.throat} tone="mid" crease="none" />
        <Line d={GEO.hopper.seams} tone="faint" />
        <Line d={GEO.hopper.rim} tone="lo" />
        <Line d={GEO.hopper.inner} tone="faint" />

        {/* Talang */}
        <Solid paths={GEO.chute.legLeft} tone="lo" crease="faint" />
        <Solid paths={GEO.chute.legRight} tone="lo" crease="faint" />
        <path className="iso-fill" d={GEO.chute.surface} />
        <Line d={GEO.chute.rails} tone="mid" />
        <Line d={GEO.chute.ties} tone="faint" />
        <Dots points={GEO.chute.ends} size={0.6} tone="mid" />

        {/* Drum penyortir */}
        <Solid paths={GEO.drum.body} tone="hi" crease="faint" />
        <Line d={GEO.drum.rim} tone="mid" />
        <Line d={GEO.drum.gradient} tone="faint" />
        <Line d={GEO.drum.tickMinor} tone="lo" />
        <Line d={GEO.drum.tickMajor} tone="mid" />
        <g ref={drumRings} />
        <g ref={drumDots} className="iso-dots" data-tone="lo" />
        <Solid paths={GEO.drum.hub} tone="mid" crease="faint" />
        <Line d={GEO.drum.hubRing} tone="lo" />
        <Solid paths={GEO.drum.knob} tone="mid" crease="faint" />
        <Line d={GEO.drum.knurl} tone="faint" />

        {/* Dial penghitung */}
        <Solid paths={GEO.dial.foot} tone="mid" crease="faint" />
        <Dots points={GEO.dial.footScrews} size={0.4} tone="mid" />
        <Solid paths={GEO.dial.sleeve} tone="mid" crease="none" />
        <Solid paths={GEO.dial.collar} tone="mid" crease="faint" />
        <Solid paths={GEO.dial.housing} tone="hi" crease="faint" />
        <Line d={GEO.dial.bezel} tone="mid" />
        <Line d={GEO.dial.face} tone="lo" />
        <Line d={GEO.dial.ticks.minor} tone="lo" />
        <Line d={GEO.dial.ticks.major} tone="mid" />
        <path ref={needle} className="iso-line" data-tone="lit" d={GEO.dial.needleRest} />
        <Solid paths={GEO.dial.crown} tone="mid" crease="faint" />
        <Line d={GEO.dial.crownKnurl} tone="faint" />

        {/* Koin: tiga sekaligus, masing-masing mengikuti fasenya sendiri */}
        {[0, 1, 2].map((i) => (
          <g
            key={i}
            ref={(el) => {
              coinNodes.current[i] = el;
            }}
            className="coin"
            style={{ opacity: 0 }}
          >
            <path className="iso-fill coin-fill" />
            <path className="iso-top coin-top" />
            <path className="iso-line iso-edge coin-edge" data-tone="lit" />
          </g>
        ))}
      </IsoFigure>
    </div>
  );
}
