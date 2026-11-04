// Migrasi warna primer Ungu -> Hijau #2FA084 untuk semua layar Stitch.
// - Hex primer/tint/teks-ungu dipetakan ke padanan hijau dgn lightness mirip
//   agar kontras (tombol putih, teks di atas tint) tetap terbaca.
// - Kategori "belanja" ungu (#a855f7) -> cokelat karat agar tak ada sisa ungu.
// - Class Tailwind indigo-*/purple-* -> emerald-*/amber-* (clamp paling dekat).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'E:/expense-tracker/stitch_personal_finance_tracker_web_app';

// Urutan penting: hex 6-digit dulu (sebelum 3-digit), lalu class Tailwind.
const HEX_MAP = [
  ['#0f0069', '#052e20'], // teks sangat gelap di atas tint terang
  ['#3323cc', '#1f6b4d'], // teks aksen gelap
  ['#3525cd', '#2fa084'], // primary (mobile + hover)
  ['#4f46e5', '#2fa084'], // primary-container (tombol desktop)
  ['#4d44e3', '#2fa084'], // surface-tint
  ['#a855f7', '#b45309'], // cat-shopping: ungu -> karat (amber-700)
  ['#c3c0ff', '#bfe9d8'], // primary-fixed-dim (tint terang)
  ['#e2dfff', '#d9f2e7'], // primary-fixed (tint terang)
  ['#dad7ff', '#c9eddd'], // on-primary-container (tint terang)
  ['#e5e1e4', '#dcefe7'], // secondary-container keabuan -> tint hijau netral
  ['#e3e1ec', '#dfe9e4'], // surface-variant / container-highest
  ['#eeedf7', '#eef4f0'], // surface-container
  ['#e8e7f1', '#e7efe9'], // surface-container-high
  ['#f4f2fd', '#f2f7f4'], // surface-container-low
  ['#fbf8ff', '#fafcfb'], // surface/background keunguan -> netral kehijauan
];

const CLASS_MAP = [
  ['bg-indigo-100/70', 'bg-emerald-100/70'],
  ['bg-purple-100/70', 'bg-amber-100/70'],
  ['bg-indigo-100', 'bg-emerald-100'],
  ['bg-purple-100', 'bg-amber-100'],
  ['bg-indigo-50', 'bg-emerald-50'],
  ['bg-purple-50', 'bg-amber-50'],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'code.html' || e.name === 'DESIGN.md') files.push(p);
  }
};
walk(ROOT);

let totalHex = 0;
const perFile = [];
for (const f of files) {
  let s = readFileSync(f, 'utf8');
  let n = 0;
  for (const [from, to] of HEX_MAP) {
    const re = new RegExp(esc(from), 'gi');
    const m = s.match(re);
    if (m) { n += m.length; s = s.replace(re, to); }
  }
  for (const [from, to] of CLASS_MAP) {
    const re = new RegExp(esc(from), 'g');
    const m = s.match(re);
    if (m) { n += m.length; s = s.replace(re, to); }
  }
  if (n > 0) { writeFileSync(f, s); perFile.push(`${f} (${n})`); }
  totalHex += n;
}

console.log(`File diubah: ${perFile.length}/${files.length}, total penggantian: ${totalHex}`);
for (const p of perFile) console.log(' -', p);

// Verifikasi: sisa ungu (hex primer maupun class indigo/purple) harus 0.
const leftovers = [];
const check = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { check(p); continue; }
    if (!e.name.endsWith('.html') && !e.name.endsWith('.md')) continue;
    const s = readFileSync(p, 'utf8');
    const bad = [];
    for (const h of ['#3525cd', '#4f46e5', '#4d44e3', '#c3c0ff', '#e2dfff', '#dad7ff', '#0f0069', '#3323cc', '#a855f7'])
      if (s.toLowerCase().includes(h)) bad.push(h);
    const cls = s.match(/bg-(indigo|purple)-\d+/g);
    if (cls) bad.push(...cls);
    if (bad.length) leftovers.push(`${p}: ${[...new Set(bad)].join(', ')}`);
  }
};
check(ROOT);
if (leftovers.length) { console.log('SISA UNGU:'); leftovers.forEach((l) => console.log(' -', l)); }
else console.log('Bersih: tidak ada sisa ungu primer.');
