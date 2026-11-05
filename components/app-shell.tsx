'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from 'cn';
import {
  ArrowLeft,
  CircleDollarSign,
  History,
  House,
  LayoutGrid,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Receipt,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { QuickAddSheet } from '@/components/quick-add-sheet';
import { formatIDR } from '@/lib/format';

interface AppShellProps {
  user: { name: string; email: string };
  totalBalance: number;
  children: React.ReactNode;
}

/** Kelompokkan menu agar sidebar 11 item tidak terasa seperti daftar panjang. */
const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { href: '/transaksi', label: 'Transaksi', icon: Receipt },
      { href: '/dompet', label: 'Dompet', icon: Wallet },
      { href: '/anggaran', label: 'Anggaran', icon: CircleDollarSign },
    ],
  },
  {
    label: 'Perencanaan',
    items: [
      { href: '/target', label: 'Target', icon: Target },
      { href: '/berulang', label: 'Berulang', icon: Repeat },
      { href: '/laporan', label: 'Laporan', icon: TrendingUp },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { href: '/keluarga', label: 'Rumah tangga', icon: Users },
      { href: '/aktivitas', label: 'Aktivitas', icon: History },
      { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
    ],
  },
];

const MOBILE_TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/transaksi', label: 'Transaksi', icon: Receipt },
  { href: null, label: 'Catat', icon: Plus, action: true as const },
  { href: '/dompet', label: 'Dompet', icon: Wallet },
  { href: '/lainnya', label: 'Lainnya', icon: MoreHorizontal },
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Drawer mobile: tutup otomatis saat rute berubah (navigasi sukses).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Kunci scroll + Escape saat drawer terbuka.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand + kembali ke beranda */}
      <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-5">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt=""
            className="size-9 rounded-xl shadow-sm transition-transform group-hover:scale-105"
          />
          <span className="text-[17px] font-extrabold tracking-tight">DompetKu</span>
        </Link>
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          title="Kembali ke beranda"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      {/* Total saldo ringkas */}
      <div className="mx-3 mt-4 rounded-2xl border border-border/70 bg-card px-3.5 py-3 shadow-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Total saldo
        </p>
        <p className="numeral mt-1 text-[19px] leading-none text-foreground">
          {formatIDR(totalBalance)}
        </p>
      </div>

      {/* Tombol catat cepat — di desktop tidak ada bottom nav, jadi ini
          satu-satunya jalan pintas tanpa pindah halaman. */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[13px] font-bold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px"
        >
          <Plus className="size-4" aria-hidden="true" />
          Catat transaksi
        </button>
      </div>

      {/* Menu.
          `min-h-0` WAJIB pada flex child yang menggulir: tanpa itu min-height
          bawaannya `auto`, nav tumbuh setinggi seluruh item, dan `overflow-y-auto`
          tidak pernah aktif — inilah sebab sidebar tidak bisa di-scroll. */}
      <nav
        aria-label="Menu aplikasi"
        data-lenis-prevent
        className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3"
      >
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="mt-3 first:mt-0">
            <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
              {g.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((n) => {
                const active = isActive(n.href);
                const Icon = n.icon;
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-all duration-200',
                        active
                          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {active && (
                        <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                      )}
                      <Icon
                        className={cn('size-[17px] shrink-0', active && 'text-brand-600 dark:text-brand-400')}
                        aria-hidden="true"
                      />
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kartu pengguna */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold leading-tight">{user.name}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ redirectTo: '/login' })}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            aria-label="Keluar dari akun"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Sidebar desktop ============ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] overflow-hidden border-r border-border/60 bg-sidebar lg:block">
        {SidebarContent}
      </aside>

      {/* ============ Drawer mobile ============ */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            'absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu aplikasi"
          className={cn(
            'absolute inset-y-0 left-0 w-[86%] max-w-[300px] border-r border-border/60 bg-sidebar shadow-xl transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
            className="absolute right-3 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
          {SidebarContent}
        </div>
      </div>

      {/* ============ Konten ============ */}
      <div className="lg:pl-[264px]">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              aria-expanded={drawerOpen}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:text-foreground"
            >
              <Menu className="size-4" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Total saldo
              </p>
              <p className="numeral truncate text-[15px] leading-tight">{formatIDR(totalBalance)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/"
                aria-label="Beranda"
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:text-foreground"
              >
                <House className="size-4" />
              </Link>
              <Link
                href="/pengaturan"
                aria-label="Pengaturan akun"
                className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
              >
                {initials(user.name)}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 pb-32 pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav
          aria-label="Navigasi bawah"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 backdrop-blur-xl lg:hidden"
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
                    <span className="-mt-4 flex size-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-transform active:scale-95">
                      <Plus className="size-6" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                      {t.label}
                    </span>
                  </button>
                );
              }
              const active = t.href ? isActive(t.href) : false;
              const Icon = t.icon;
              return (
                <Link
                  key={t.label}
                  href={t.href!}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
                    active ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-[21px]" aria-hidden="true" />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <QuickAddSheet
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
