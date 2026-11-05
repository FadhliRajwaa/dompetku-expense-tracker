'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { QuickAddSheet } from '@/components/quick-add-sheet';
import { formatIDR } from '@/lib/format';

interface AppShellProps {
  user: { name: string; email: string };
  totalBalance: number;
  children: React.ReactNode;
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { href: '/transaksi', label: 'Transaksi', icon: 'receipt_long' },
  { href: '/dompet', label: 'Dompet', icon: 'account_balance_wallet' },
  { href: '/anggaran', label: 'Anggaran', icon: 'donut_small' },
  { href: '/laporan', label: 'Laporan', icon: 'insights' },
  { href: '/pengaturan', label: 'Pengaturan', icon: 'settings' },
];

const MOBILE_TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { href: '/transaksi', label: 'Transaksi', icon: 'receipt_long' },
  { href: null, label: 'Catat', icon: 'add', action: true },
  { href: '/dompet', label: 'Dompet', icon: 'account_balance_wallet' },
  { href: '/lainnya', label: 'Lainnya', icon: 'more_horiz' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function AppShell({ user, totalBalance, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Sidebar desktop ============ */}
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] flex-col lg:flex">
        <div className="flex h-full flex-col px-4 py-5">
          <Link href="/dashboard" className="group flex items-center gap-2.5 px-2">
            <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl shadow-sm transition-transform group-hover:scale-105" />
            <span className="text-[17px] font-extrabold tracking-tight text-foreground">DompetKu</span>
          </Link>

          <nav className="mt-7 flex flex-1 flex-col gap-0.5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
              Menu
            </p>
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                  )}
                  <span
                    className={`material-symbols-outlined text-[21px] ${active ? 'text-brand-600' : ''}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {n.icon}
                  </span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Kartu saldo */}
          <div className="relative mt-4 overflow-hidden rounded-2xl bg-foreground p-4 text-background grain">
            <div
              className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
              style={{ background: 'var(--brand-400)' }}
            />
            <p className="relative text-[11px] font-medium uppercase tracking-[0.12em] text-background/55">
              Total saldo
            </p>
            <p className="numeral relative mt-1 text-[22px] text-background">{formatIDR(totalBalance)}</p>
            <div className="relative mt-4 flex items-center gap-2.5 border-t border-background/12 pt-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/25 text-[11px] font-bold text-brand-200">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-background/90">{user.name}</p>
                <p className="truncate text-[10px] text-background/45">{user.email}</p>
              </div>
              <button
                onClick={() => signOut({ redirectTo: '/login' })}
                className="rounded-lg p-1.5 text-background/50 transition-colors hover:bg-background/10 hover:text-background"
                aria-label="Keluar"
                title="Keluar"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ============ Konten ============ */}
      <div className="lg:pl-[264px]">
        {/* Header mobile — hanya brand + saldo, sapaan ada di judul halaman */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Total saldo
                </p>
                <p className="numeral truncate text-[16px] leading-tight text-foreground">
                  {formatIDR(totalBalance)}
                </p>
              </div>
            </div>
            <Link
              href="/pengaturan"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700"
              aria-label="Pengaturan akun"
            >
              {initials(user.name)}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-32 pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/92 backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid grid-cols-5 px-1">
            {MOBILE_TABS.map((t) => {
              if (t.action) {
                return (
                  <button
                    key={t.label}
                    onClick={() => setQuickAddOpen(true)}
                    className="flex min-h-[56px] flex-col items-center justify-center gap-0.5"
                    aria-label="Catat transaksi"
                  >
                    <span className="-mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-transform active:scale-95">
                      <span className="material-symbols-outlined text-[26px]">add</span>
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600">{t.label}</span>
                  </button>
                );
              }
              const active = t.href ? isActive(t.href) : false;
              return (
                <Link
                  key={t.label}
                  href={t.href!}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                    active ? 'text-brand-600' : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[23px]"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {t.icon}
                  </span>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} onSaved={() => router.refresh()} />
    </div>
  );
}
