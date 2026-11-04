'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
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
  { href: '/anggaran', label: 'Anggaran', icon: 'pie_chart' },
  { href: '/laporan', label: 'Laporan', icon: 'insights' },
  { href: '/pengaturan', label: 'Pengaturan', icon: 'settings' },
];

const MOBILE_TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { href: '/transaksi', label: 'Transaksi', icon: 'receipt_long' },
  { href: null, label: 'Catat', icon: 'add_circle', action: true },
  { href: '/dompet', label: 'Dompet', icon: 'account_balance_wallet' },
  { href: '/lainnya', label: 'Lainnya', icon: 'more_horiz' },
];

export function AppShell({ user, totalBalance, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  async function logout() {
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="min-h-screen bg-[#fafcfb]">
      {/* Sidebar desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col justify-between bg-white border-r p-4 lg:flex">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2">
            <img src="/logo.svg" alt="Logo DompetKu" className="h-9 w-9" />
            <span className="font-bold">DompetKu</span>
          </Link>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname.startsWith(n.href)
                    ? 'bg-[#2FA084] text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="rounded-xl bg-[#d9f2e7] p-3">
          <p className="text-xs text-[#1f6b4d]">Total Saldo</p>
          <p className="font-bold">{formatIDR(totalBalance)}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={logout}>
            Keluar ({user.name})
          </Button>
        </div>
      </aside>

      {/* Konten */}
      <div className="lg:pl-60">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 border-b bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Halo, {user.name}</p>
              <p className="text-lg font-bold">{formatIDR(totalBalance)}</p>
            </div>
            <Button
              onClick={() => setQuickAddOpen(true)}
              className="bg-[#2FA084] hover:bg-[#27856d] text-white rounded-full h-11 w-11 p-0 text-2xl"
              aria-label="Catat cepat"
            >
              +
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 lg:pb-10">{children}</main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-1 lg:hidden">
          <div className="grid grid-cols-5">
            {MOBILE_TABS.map((t) =>
              t.action ? (
                <button
                  key={t.label}
                  onClick={() => setQuickAddOpen(true)}
                  className="flex flex-col items-center gap-0.5 py-2 text-[#2FA084]"
                >
                  <span className="material-symbols-outlined text-3xl -mt-4 rounded-full bg-[#2FA084] text-white p-1.5 shadow-lg">add</span>
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ) : (
                <Link
                  key={t.label}
                  href={t.href!}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                    t.href && pathname.startsWith(t.href) ? 'text-[#2FA084]' : 'text-zinc-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                  {t.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      </div>

      <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} onSaved={() => router.refresh()} />
    </div>
  );
}
