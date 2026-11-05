'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Scroll halus global (Lenis).
 *
 * Sengaja TIDAK memakai `lenis/dist/lenis.css` karena stylesheet itu menambahkan
 * `scroll-behavior` global yang bertabrakan dengan anchor `#fitur` bawaan browser.
 * AutoRaf diurus manual agar satu loop rAF saja yang berjalan.
 *
 * `prefers-reduced-motion` dihormati: Lenis dilewati sepenuhnya dan browser
 * kembali ke scroll native. Ini bukan sekadar sopan santun — vestibular
 * disorder bisa memicu mual dari scroll berinertia.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      // `lerp` (bukan `duration` + `easing`). Mode durasi memasang tween tetap
      // yang di-restart tiap ketukan roda: dengan ease-out-expo, ~60% jarak
      // habis di 100 ms pertama lalu sisanya merayap di bawah 1 px/frame
      // selama hampir sedetik — persis yang terasa "patah-patah". `lerp`
      // menggerakkan sebagian tetap dari sisa jarak setiap frame, jadi
      // kecepatannya turun mulus tanpa ekor panjang. 0.1 = rekomendasi Lenis.
      lerp: 0.1,
      smoothWheel: true,
      // Sentuhan dibiarkan native: inertia jari di HP sudah lebih baik
      // daripada emulasi JS, dan menghindari konflik dengan bottom sheet.
      syncTouch: false,
      touchMultiplier: 1.6,
      // WAJIB. Tanpa ini Lenis memanggil preventDefault() pada setiap wheel,
      // sehingga semua elemen `overflow-y-auto` di dalam halaman — sidebar,
      // isi dropdown, dan dialog — tidak pernah bisa di-scroll. Dengan opsi
      // ini Lenis memeriksa apakah pointer sedang di atas wadah yang masih
      // bisa di-scroll, dan menyerahkan gesture ke wadah itu; begitu wadah
      // mencapai ujung, scroll kembali ke halaman.
      allowNestedScroll: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Anchor internal (#fitur, #faq) harus tetap mulus dan memperhitungkan
    // header sticky setinggi 64px.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -64, duration: 1.1 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
