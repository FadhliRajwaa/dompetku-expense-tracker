'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from 'cn';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
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

const EXPANDED_W = 264;
const COLLAPSED_W = 76;
const STORAGE_KEY = 'dompetku-sidebar-collapsed';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Label mengambang saat sidebar diciutkan — pengganti teks yang hilang. */
function TooltipLabel({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11.5px] font-semibold text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 lg:block"
    >
      {children}
    </span>
  );
}

export function AppShell({ user, totalBalance, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Baca pilihan terakhir setelah mount. Tidak dilakukan saat render agar
  // HTML server dan klien identik (tidak ada hydration mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      /* localStorage bisa diblokir; pakai default terbuka. */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* abaikan */
      }
      return next;
    });
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Drawer mobile: tutup otomatis saat rute berubah (navigasi sukses).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer hanya ada di layar kecil; kalau jendela diperlebar saat drawer
  // terbuka, tutup supaya konten tidak tertinggal dalam keadaan `inert`.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setDrawerOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Kunci scroll + Escape saat drawer terbuka, dan pindahkan fokus ke dalam
  // panel. Tanpa ini Tab tetap berjalan di halaman di belakang overlay.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [drawerOpen]);

  /**
   * Isi sidebar, dirender langsung (bukan sebagai komponen) supaya identitas
   * fungsinya stabil antar-render — kalau dideklarasikan sebagai komponen di
   * dalam AppShell, React menganggapnya tipe baru setiap render dan me-remount
   * seluruh menu.
   *
   * `mini` hanya berlaku di desktop: drawer mobile selalu lebar penuh karena
   * layar kecil tidak punya ruang untuk ikon tanpa label.
   *
   * `variant` memisahkan dua konteks yang butuh kontrol berbeda. Di drawer
   * mobile hanya ada satu tombol — tutup. Tombol ciutkan tidak punya arti di
   * layar kecil, dan tombol beranda sudah tersedia di header aplikasi; saat
   * ketiganya dirender bersama, tombol tutup yang dulu berposisi `absolute`
   * menimpa ikon beranda dan menghasilkan satu ikon rusak.
   */
  const renderSidebar = (mini: boolean, variant: 'desktop' | 'drawer' = 'desktop') => (
    <div className="flex h-full flex-col">
      {/* Brand + kontrol */}
      <div
        className={cn(
          'flex items-center gap-2 pb-1 pt-5 transition-[padding] duration-200',
          mini ? 'flex-col px-2' : 'justify-between px-4',
        )}
      >
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5"
          aria-label="Ke dashboard"
        >
          <img
            src="/logo.svg"
            alt=""
            className="size-9 shrink-0 rounded-xl shadow-sm transition-transform group-hover:scale-105"
          />
          {!mini && (
            <span className="text-[17px] font-extrabold tracking-tight">DompetKu</span>
          )}
        </Link>

        {variant === 'drawer' ? (
          <button
            ref={closeRef}
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
            title="Tutup menu"
            className="-mr-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        ) : mini ? (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              onClick={toggleCollapsed}
              aria-label="Lebarkan sidebar"
              aria-expanded={!collapsed}
              title="Lebarkan sidebar"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <Link
              href="/"
              aria-label="Kembali ke beranda"
              title="Kembali ke beranda"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleCollapsed}
              aria-label="Ciutkan sidebar"
              aria-expanded={!collapsed}
              title="Ciutkan sidebar"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <Link
              href="/"
              aria-label="Kembali ke beranda"
              title="Kembali ke beranda"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      {/* Saldo ringkas. Saat mini hanya ikon dompet dengan tooltip saldo. */}
      {mini ? (
        <div className="group relative mx-auto mt-4 flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card text-brand-600 shadow-xs">
          <Wallet className="size-4.5" aria-hidden="true" />
          <TooltipLabel show>{formatIDR(totalBalance)}</TooltipLabel>
          <span className="sr-only">Total saldo {formatIDR(totalBalance)}</span>
        </div>
      ) : (
        <div
          className={cn(
            'mx-3 mt-4 rounded-2xl border border-border/70 bg-card px-3.5 py-3 shadow-xs',
            // Di layar pendek (HP mendatar) kartu saldo memakan hampir separuh
            // tinggi drawer dan menyisakan menu yang cuma muat tiga item.
            // Saldo sudah tampil di header aplikasi, jadi aman disembunyikan.
            variant === 'drawer' && '[@media(max-height:560px)]:hidden',
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Total saldo
          </p>
          <p className="numeral mt-1 text-[19px] leading-none text-foreground">
            {formatIDR(totalBalance)}
          </p>
        </div>
      )}

      {/* Catat cepat */}
      <div
        className={cn(
          'pt-3',
          mini ? 'px-2' : 'px-3',
          variant === 'drawer' && '[@media(max-height:560px)]:hidden',
        )}
      >
        <button
          onClick={() => setQuickAddOpen(true)}
          aria-label="Catat transaksi"
          title="Catat transaksi"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[13px] font-bold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px',
            'h-10',
          )}
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          {!mini && <span>Catat transaksi</span>}
        </button>
      </div>

      {/* Menu.
          `min-h-0` WAJIB pada flex child yang menggulir: tanpa itu min-height
          bawaannya `auto`, nav tumbuh setinggi seluruh item, dan `overflow-y-auto`
          tidak pernah aktif — inilah sebab sidebar tidak bisa di-scroll. */}
      <nav
        aria-label="Menu aplikasi"
        data-lenis-prevent
        className={cn(
          'mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3',
          mini ? 'px-2' : 'px-3',
        )}
      >
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="mt-3 first:mt-0">
            {mini ? (
              <div className="mx-auto mb-2 h-px w-6 bg-border/70" aria-hidden="true" />
            ) : (
              <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {g.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {g.items.map((n) => {
                const active = isActive(n.href);
                const Icon = n.icon;
                return (
                  <li key={n.href} className="relative">
                    <Link
                      href={n.href}
                      aria-current={active ? 'page' : undefined}
                      aria-label={mini ? n.label : undefined}
                      title={mini ? undefined : n.label}
                      className={cn(
                        'group relative flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-200',
                        mini ? 'mx-auto size-10 justify-center' : 'gap-3 px-2.5 py-2',
                        active
                          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {active && !mini && (
                        <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                      )}
                      {active && mini && (
                        <span className="absolute -left-2 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                      )}
                      <Icon
                        className={cn(
                          'size-[17px] shrink-0',
                          active && 'text-brand-600 dark:text-brand-400',
                        )}
                        aria-hidden="true"
                      />
                      {!mini && n.label}
                      <TooltipLabel show={mini}>{n.label}</TooltipLabel>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kartu pengguna */}
      <div className={cn('border-t border-border/60 p-3', mini && 'px-2')}>
        {mini ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/pengaturan"
              className="group relative flex size-9 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white"
              aria-label={`Pengaturan akun ${user.name}`}
            >
              {initials(user.name)}
              <TooltipLabel show>{user.name}</TooltipLabel>
            </Link>
            <button
              onClick={() => signOut({ redirectTo: '/login' })}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              aria-label="Keluar dari akun"
              title="Keluar"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
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
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Sidebar desktop ============ */}
      <aside
        // Lebar dianimasikan lewat `width` (bukan transform) karena isi di
        // dalamnya harus ikut menyesuaikan: label menghilang, ikon memusat.
        style={{ width: sidebarW }}
        className="fixed inset-y-0 left-0 z-30 hidden overflow-hidden border-r border-border/60 bg-sidebar transition-[width] duration-200 ease-out lg:block"
        data-collapsed={collapsed ? '' : undefined}
      >
        {renderSidebar(collapsed)}
      </aside>

      {/* ============ Drawer mobile ============ */}
      {/* `inert` saat tertutup: panel digeser keluar layar tetapi tetap ada di
          DOM, jadi tanpa ini tautan di dalamnya masih bisa dijangkau Tab. */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
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
          style={{
            // Layar berponi: konten jangan masuk ke bawah notch atau bilah
            // gestur saat aplikasi dipasang sebagai PWA.
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          className={cn(
            'absolute inset-y-0 left-0 w-[86%] max-w-[304px] border-r border-border/60 bg-sidebar shadow-xl outline-none transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {renderSidebar(false, 'drawer')}
        </div>
      </div>

      {/* ============ Konten ============ */}
      {/* `inert` selama drawer terbuka: halaman di belakang overlay tidak bisa
          dijangkau Tab, jadi fokus tetap berputar di dalam menu. */}
      <div
        inert={drawerOpen}
        className={cn(
          'transition-[padding] duration-200 ease-out',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]',
        )}
      >
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
              {/* Avatar memakai brand pekat, sama seperti di sidebar dan kartu
                  profil. Varian `brand-50` sebelumnya menghasilkan inisial hijau
                  pucat di atas hijau pucat — hampir tidak terbaca. */}
              <Link
                href="/pengaturan"
                aria-label="Pengaturan akun"
                className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white shadow-sm shadow-brand-500/25"
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
