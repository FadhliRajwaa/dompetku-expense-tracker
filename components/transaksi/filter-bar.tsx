'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Select } from '@/components/ui/select-premium';
import { DatePicker } from '@/components/ui/date-picker';
import { useDebouncedValue } from '@/lib/use-debounced';

interface WalletOpt {
  id: string;
  name: string;
}

/**
 * Bar filter transaksi.
 *
 * Menggantikan `<form method=get>` penuh muat ulang: setiap perubahan langsung
 * mendorong query string baru lewat router.replace, sehingga halaman hanya
 * me-render ulang bagian server yang perlu. Tombol "Terapkan" tetap ada sebagai
 * jalur aksesibel (Enter dari input pencarian).
 */
export function FilterBar({
  initial,
  wallets,
}: {
  initial: { q?: string; type?: string; walletId?: string; from?: string; to?: string };
  wallets: WalletOpt[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? '');
  const [type, setType] = useState(initial.type ?? '');
  const [walletId, setWalletId] = useState(initial.walletId ?? '');
  const [from, setFrom] = useState(initial.from ?? '');
  const [to, setTo] = useState(initial.to ?? '');
  const [expanded, setExpanded] = useState(Boolean(initial.from || initial.to));

  /**
   * Pencarian menerapkan query otomatis setelah pengguna berhenti mengetik.
   * Tanpa debounce, setiap ketukan memicu navigasi server dan riwayat
   * `router.replace` bisa bertumpuk.
   */
  const debouncedQ = useDebouncedValue(q, 350);
  const appliedQ = useRef(initial.q ?? '');
  useEffect(() => {
    if (debouncedQ.trim() === appliedQ.current.trim()) return;
    appliedQ.current = debouncedQ;
    apply({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const activeCount =
    (initial.q ? 1 : 0) +
    (initial.type ? 1 : 0) +
    (initial.walletId ? 1 : 0) +
    (initial.from || initial.to ? 1 : 0);

  function apply(next?: Partial<{ q: string; type: string; walletId: string; from: string; to: string }>) {
    const params = new URLSearchParams();
    const v = { q, type, walletId, from, to, ...next };
    if (v.q?.trim()) params.set('q', v.q.trim());
    if (v.type) params.set('type', v.type);
    if (v.walletId) params.set('walletId', v.walletId);
    if (v.from) params.set('from', v.from);
    if (v.to) params.set('to', v.to);
    const qs = params.toString();
    router.replace(qs ? `/transaksi?${qs}` : '/transaksi');
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            appliedQ.current = q;
            apply();
          }}
          role="search"
          className="relative flex-1"
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            name="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari catatan transaksi…"
            aria-label="Cari catatan transaksi"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-9 text-[13px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                appliedQ.current = '';
                apply({ q: '' });
              }}
              aria-label="Hapus kata kunci"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Di HP kontrol turun ke baris sendiri dengan lebar penuh; di
            desktop semuanya sejajar. Sebelumnya satu baris dipaksa dan tombol
            "Terapkan" terdorong keluar layar. */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <div className="col-span-1 min-w-0 sm:w-[140px]">
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                apply({ type: v });
              }}
              options={[
                { value: '', label: 'Semua tipe' },
                { value: 'EXPENSE', label: 'Pengeluaran', icon: 'north_east' },
                { value: 'INCOME', label: 'Pemasukan', icon: 'south_west' },
              ]}
              size="sm"
              aria-label="Tipe transaksi"
            />
          </div>

          <div className="col-span-1 min-w-0 sm:w-[150px]">
            <Select
              value={walletId}
              onValueChange={(v) => {
                setWalletId(v);
                apply({ walletId: v });
              }}
              options={[
                { value: '', label: 'Semua dompet' },
                ...wallets.map((w) => ({ value: w.id, label: w.name })),
              ]}
              size="sm"
              aria-label="Dompet"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label="Filter rentang tanggal"
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:w-9 sm:flex-none"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span className="sm:hidden">Tanggal</span>
            </button>

            <button
              type="button"
              onClick={() => apply()}
              className="h-9 flex-1 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-600 sm:flex-none"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2.5 grid gap-2.5 border-t border-border/60 pt-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted-foreground">
              Dari tanggal
            </label>
            <DatePicker
              value={from}
              onChange={(v) => {
                setFrom(v);
                apply({ from: v });
              }}
              size="sm"
              clearable
              aria-label="Dari tanggal"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] font-semibold text-muted-foreground">
              Sampai tanggal
            </label>
            <DatePicker
              value={to}
              onChange={(v) => {
                setTo(v);
                apply({ to: v });
              }}
              size="sm"
              clearable
              aria-label="Sampai tanggal"
            />
          </div>
          {activeCount > 0 && (
            <Link
              href="/transaksi"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-border px-3 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
              Reset ({activeCount})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
