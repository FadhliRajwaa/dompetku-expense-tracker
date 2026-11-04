// Generate favicon PNG multi-ukuran + apple-touch-icon dari public/logo.svg.
// Jalankan: node scripts/gen-icons.mjs
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('public/logo.svg');
const jobs = [
  ['public/favicon-16x16.png', 16],
  ['public/favicon-32x32.png', 32],
  ['public/icon-192x192.png', 192],
  ['public/icon-512x512.png', 512],
  ['public/apple-touch-icon.png', 180],
];
for (const [out, size] of jobs) {
  // eslint-disable-next-line no-await-in-loop
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(out);
  console.log('wrote', out);
}
