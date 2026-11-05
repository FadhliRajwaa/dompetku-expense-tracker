'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Registrasi plugin di level modul, bukan di dalam useEffect.
 *
 * Sebelumnya tiap komponen mendaftarkan sendiri di dalam efek. Komponen yang
 * efek-nya berjalan lebih dulu (Hero) memakai `scrollTrigger` sebelum plugin
 * terdaftar, sehingga timeline-nya di-revert di tengah jalan dan elemen
 * tertinggal pada state awal (opacity 0). Mendaftar sekali di sini menghapus
 * ketergantungan pada urutan mount.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
