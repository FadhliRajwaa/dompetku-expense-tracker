'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/gsap';

/**
 * Reveal saat scroll dengan GSAP ScrollTrigger.
 *
 * Perilaku yang diminta: animasi berjalan saat section masuk viewport PERTAMA
 * kali, lalu MENGULANG setiap kali keluar dari viewport dan masuk lagi — baik
 * dari atas maupun dari bawah. Itu perilaku default `toggleActions:
 * 'play none none reset'` ditambah `once: false`. Elemen yang sudah selesai
 * animasi akan di-reset ketika keluar layar sehingga bisa diputar ulang.
 *
 * Kenapa ScrollTrigger dan bukan IntersectionObserver biasa: ScrollTrigger
 * memakai satu listener scroll ter-throttle untuk seluruh halaman, bukan satu
 * observer per elemen. Di halaman dengan 60+ kartu, biaya observasi ini terasa.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  stagger,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Bila diisi, anak langsung (`.reveal-item`) dianimasikan berurutan. */
  stagger?: number;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'article' | 'header' | 'aside';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      if (stagger) gsap.set(el.querySelectorAll('.reveal-item'), { opacity: 1, y: 0 });
      return;
    }

    const targets = stagger ? el.querySelectorAll('.reveal-item') : [el];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay,
          stagger: stagger ?? 0,
          // ease-out-quint: deselerasi tegas, tanpa overshoot
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'bottom 12%',
            // reset -> animasi berjalan lagi saat di-scroll balik
            toggleActions: 'play none none reset',
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger, pathname]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
