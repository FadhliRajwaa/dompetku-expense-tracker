'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const DONUT = [
  { label: 'Tagihan', value: 51, color: '#2FA084' },
  { label: 'Belanja', value: 27, color: '#E9A23B' },
  { label: 'Hiburan', value: 11, color: '#5AA9C8' },
  { label: 'Lainnya', value: 11, color: '#B7C9C4' },
];

const TXNS = [
  { name: 'Gaji bulanan', wallet: 'BCA Tahapan', amount: '+Rp 14.500.000', income: true },
  { name: 'Makan siang', wallet: 'Dompet Tunai', amount: '-Rp 45.000', income: false },
  { name: 'Langganan musik', wallet: 'GoPay', amount: '-Rp 54.000', income: false },
];

/**
 * Mockup dashboard di hero.
 *
 * Bukan gambar: semuanya DOM + SVG hidup, jadi tajam di layar retina dan tidak
 * menambah byte aset. Dua kartu kecil sengaja diletakkan DI BAWAH kartu utama
 * (bukan menumpuk di atasnya) supaya tidak menutupi angka saldo — versi
 * sebelumnya menaruhnya absolut di dalam kartu dan menutupi total saldo.
 */
export function HeroPreview() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.donut-seg', {
        strokeDasharray: '0 100',
        duration: 1.1,
        stagger: 0.12,
        delay: 0.55,
        ease: 'power3.out',
      });
      gsap.from('.preview-row', {
        opacity: 0,
        y: 8,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.85,
        ease: 'power2.out',
      });
      gsap.from('.mini-card', {
        opacity: 0,
        y: 14,
        duration: 0.55,
        stagger: 0.12,
        delay: 1.05,
        ease: 'power3.out',
      });
    }, root);
    return () => ctx.revert();
  }, []);

  let acc = 0;

  return (
    <div ref={root} className="relative w-full max-w-[452px] pb-[104px]">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[40px] bg-brand-500/10 blur-3xl" />

      {/* Kartu utama */}
      <div className="relative overflow-hidden rounded-[26px] border border-border/70 bg-card p-5 shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Total saldo
            </p>
            <p className="numeral mt-1 text-[26px] leading-none">Rp 36.323.000</p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <span className="material-symbols-outlined text-[19px]">account_balance_wallet</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-brand-50/80 px-3 py-2.5 dark:bg-brand-900/30">
            <p className="text-[9.5px] font-bold uppercase tracking-wide text-brand-700/70 dark:text-brand-300/80">
              Masuk
            </p>
            <p className="numeral mt-0.5 text-[14px] text-brand-800 dark:text-brand-200">
              +17.250.000
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 px-3 py-2.5 dark:bg-rose-950/40">
            <p className="text-[9.5px] font-bold uppercase tracking-wide text-rose-600/70 dark:text-rose-300/80">
              Keluar
            </p>
            <p className="numeral mt-0.5 text-[14px] text-rose-700 dark:text-rose-300">-684.000</p>
          </div>
        </div>

        {/* Donut komposisi */}
        <div className="mt-3 flex items-center gap-4 rounded-xl border border-border/60 p-3">
          <svg viewBox="0 0 42 42" className="size-[74px] shrink-0 -rotate-90" aria-hidden="true">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="5.5" />
            {DONUT.map((s) => {
              const offset = acc;
              acc += s.value;
              return (
                <circle
                  key={s.label}
                  className="donut-seg"
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="5.5"
                  strokeDasharray={`${s.value} 100`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="min-w-0 flex-1 space-y-1">
            {DONUT.slice(0, 3).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 truncate font-medium text-foreground/80">{s.label}</span>
                <span className="font-semibold tabular text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi */}
        <div className="mt-3 space-y-2.5">
          {TXNS.map((t) => (
            <div key={t.name} className="preview-row flex items-center gap-2.5">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                  t.income
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {t.income ? 'south_west' : 'north_east'}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold leading-tight">{t.name}</p>
                <p className="truncate text-[9.5px] text-muted-foreground">{t.wallet}</p>
              </div>
              <span
                className={`shrink-0 text-[11.5px] font-bold tabular ${
                  t.income ? 'text-income' : 'text-foreground'
                }`}
              >
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dua kartu kecil — di bawah kartu utama, hanya menimpa tepi bawahnya */}
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-2.5 px-2">
        <div className="mini-card rounded-2xl border border-border/70 bg-card p-3 shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Budget makan
            </p>
            <span className="shrink-0 rounded-full bg-brand-50 px-1.5 py-0.5 text-[8.5px] font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              Aman
            </span>
          </div>
          <p className="numeral mt-1 text-[13.5px] leading-none">Rp 1.240.000</p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[48%] rounded-full bg-brand-500" />
          </div>
          <p className="mt-1 text-[9px] text-muted-foreground">48% dari Rp 2.500.000</p>
        </div>

        <div className="mini-card rounded-2xl border border-border/70 bg-card p-3 shadow-[var(--shadow-lg)]">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
              <span className="material-symbols-outlined text-[12px]">savings</span>
            </span>
            <p className="truncate text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Dana darurat
            </p>
          </div>
          <p className="numeral mt-1 text-[13.5px] leading-none">Rp 8.400.000</p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[70%] rounded-full bg-brand-400" />
          </div>
          <p className="mt-1 text-[9px] text-muted-foreground">70% dari Rp 12.000.000</p>
        </div>
      </div>
    </div>
  );
}
