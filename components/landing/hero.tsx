'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { HeroPreview } from '@/components/landing/hero-preview';

/**
 * Hero landing.
 *
 * Timeline masuk dijalankan sekali saat mount dengan stagger kiri→kanan.
 * `ScrollTrigger.refresh()` dipanggil setelah timeline selesai karena tinggi
 * panel berubah selama animasi; tanpa refresh, trigger lain di halaman tetap
 * memakai posisi lama dan bisa memotong reveal.
 */
export function Hero({ loggedIn }: { loggedIn: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => ScrollTrigger.refresh(),
      });

      tl.from('[data-hero="badge"]', { y: 14, opacity: 0, duration: 0.6 })
        .from('[data-hero="line"]', { y: 34, opacity: 0, duration: 0.9, stagger: 0.11 }, '-=0.35')
        .from('[data-hero="lede"]', { y: 16, opacity: 0, duration: 0.7 }, '-=0.55')
        .from(
          '[data-hero="cta"]',
          // `clearProps` wajib: tanpa ini sisa inline transform/opacity dari
          // animasi bisa bentrok dengan utility hover pada tombol.
          { y: 14, opacity: 0, duration: 0.6, stagger: 0.08, clearProps: 'transform,opacity' },
          '-=0.45',
        )
        .from('[data-hero="proof"]', { y: 10, opacity: 0, duration: 0.5 }, '-=0.35')
        .from(
          '[data-hero="panel"]',
          { y: 40, opacity: 0, scale: 0.97, duration: 1.05, ease: 'power4.out' },
          0.15,
        );

      // Parallax hanya desktop: di HP panel sudah memenuhi lebar layar.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.to('[data-hero="panel"]', {
          yPercent: -7,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      {/* Latar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 mesh-brand opacity-90" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(60% 55% at 50% 30%, #000 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(60% 55% at 50% 30%, #000 20%, transparent 100%)',
          }}
        />
        {/* Sorotan latar: gradien, bukan `blur-3xl`. Lihat `.glow-*` di globals.css. */}
        <div className="glow-300 absolute -left-32 top-10 size-64 rounded-full" />
        <div className="glow-200 absolute -right-24 top-40 size-72 rounded-full" />
      </div>

      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8 lg:pb-24">
        <div>
          <span
            data-hero="badge"
            className="inline-flex items-center gap-2 rounded-full border border-brand-300/60 bg-white/70 px-3 py-1.5 text-[11.5px] font-bold text-brand-700 shadow-xs backdrop-blur dark:bg-brand-900/30 dark:text-brand-200"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
            </span>
            Gratis · open source · tanpa kartu kredit
          </span>

          <h1 className="text-display mt-6 text-[2.85rem] leading-[1.02] tracking-tight sm:text-[3.5rem] lg:text-[4.05rem]">
            <span data-hero="line" className="block">
              Uangmu punya cerita.
            </span>
            <span data-hero="line" className="block">
              <em className="italic text-brand-600">Baca seluruhnya.</em>
            </span>
          </h1>

          <p
            data-hero="lede"
            className="mt-5 max-w-[460px] text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15.5px]"
          >
            DompetKu mencatat setiap pemasukan dan pengeluaran, menjaga saldo tiap dompet tetap
            akurat, dan menunjukkan ke mana uangmu benar-benar pergi — sebelum bulan berakhir.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Link
              data-hero="cta"
              href={loggedIn ? '/dashboard' : '/register'}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-[14.5px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 active:translate-y-px"
            >
              {loggedIn ? 'Buka dashboard' : 'Mulai gratis sekarang'}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              data-hero="cta"
              href={loggedIn ? '/transaksi' : '#cara-kerja'}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-white/70 px-6 text-[14.5px] font-bold text-foreground backdrop-blur transition-colors hover:bg-white dark:bg-card/70 dark:hover:bg-card"
            >
              {loggedIn ? 'Lihat transaksi' : 'Lihat cara kerjanya'}
            </Link>
          </div>

          <ul
            data-hero="proof"
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground"
          >
            {['Gratis selamanya', 'Tanpa batas transaksi', 'Login Google tersedia'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-brand-500" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div data-hero="panel" className="w-full max-w-[452px] lg:justify-self-end">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
