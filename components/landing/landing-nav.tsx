'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import { ArrowRight, Menu, X } from 'lucide-react';

const NAV = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#tanya', label: 'Tanya jawab' },
];

/**
 * Navigasi landing.
 *
 * Tiga keadaan yang harus terlihat berbeda: di puncak halaman (transparan),
 * setelah scroll (kartu kaca ber-border), dan saat menu mobile terbuka.
 * CTA-nya sadar sesi: "Masuk" berubah menjadi "Buka dashboard".
 */
export function LandingNav({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Kunci scroll saat drawer mobile terbuka, dan tutup dengan Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/*
        Lapisan latar dipisah dari header dan hanya di-transisikan `opacity`.
        Sebelumnya header sendiri yang berubah warna sambil memakai
        `backdrop-blur`: men-transisikan `background-color` pada elemen
        ber-blur memaksa blur dihitung ulang di main thread tiap frame —
        satu frame membeku sampai ~100 ms tiap kali status scroll berganti.
        Dengan lapisan terpisah, blur cukup di-composite.
      */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 border-b bg-background/80 backdrop-blur-xl transition-opacity duration-300 supports-[backdrop-filter]:bg-background/65',
          scrolled ? 'border-border/60 opacity-100' : 'border-transparent opacity-0',
        )}
      />
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="DompetKu, beranda">
          <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-[16px] font-extrabold tracking-tight">DompetKu</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[13px] font-bold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px"
            >
              Buka dashboard
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[13px] font-bold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px"
              >
                Mulai gratis
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="ml-0.5 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      <div
        id="menu-mobile"
        hidden={!menuOpen}
        className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label="Navigasi seluler" className="flex flex-col gap-0.5 px-4 py-3">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {n.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="col-span-2 flex h-11 items-center justify-center rounded-xl bg-brand-500 text-[13.5px] font-bold text-white"
              >
                Buka dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center rounded-xl border border-border text-[13.5px] font-semibold"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex h-11 items-center justify-center rounded-xl bg-brand-500 text-[13.5px] font-bold text-white"
                >
                  Mulai gratis
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
