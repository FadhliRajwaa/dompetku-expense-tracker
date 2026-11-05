'use client';

import Link from 'next/link';
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatIDR } from '@/lib/format';

function Trend({ pct, invert = false }: { pct: number; invert?: boolean }) {
  if (!Number.isFinite(pct)) return null;
  const up = pct >= 0;
  const good = invert ? !up : up;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${
        good ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="whitespace-nowrap">
        {up ? '+' : ''}
        {pct.toFixed(1)}%
      </span>
      <span className="whitespace-nowrap font-normal text-muted-foreground">vs bulan lalu</span>
    </span>
  );
}

export function DashboardHero({
  firstName,
  monthLabel,
  totalBalance,
  activeWallets,
  income,
  expense,
  incomeChangePct,
  expenseChangePct,
}: {
  firstName: string;
  monthLabel: string;
  totalBalance: number;
  activeWallets: number;
  income: number;
  expense: number;
  incomeChangePct: number;
  expenseChangePct: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Judul */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
            {monthLabel}
          </p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">
            Halo, {firstName}
          </h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Ringkasan arus keuangan dan anggaranmu bulan ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/laporan"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-[12.5px] font-semibold shadow-xs transition-colors hover:bg-muted"
          >
            <span className="material-symbols-outlined text-[16px] text-muted-foreground">
              insights
            </span>
            Laporan
          </Link>
          <Link
            href="/transaksi"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Semua transaksi
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Baris metrik */}
      <div className="grid gap-3 lg:grid-cols-[1.5fr_0.75fr_0.75fr]">
        {/* Saldo — kartu tinta, satu-satunya elemen gelap di halaman */}
        <div className="relative overflow-hidden rounded-2xl card-ink p-5 grain sm:p-6">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-52 rounded-full opacity-30 blur-3xl"
            style={{ background: 'var(--brand-400)' }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">
                Total saldo
              </p>
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                <Wallet className="size-[17px] text-brand-300" aria-hidden="true" />
              </span>
            </div>
            <p className="numeral mt-3 text-[2rem] leading-none text-white sm:text-[2.5rem]">
              {formatIDR(totalBalance)}
            </p>
            <p className="mt-2 text-[12.5px] text-white/45">
              tersebar di {activeWallets} dompet aktif
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/dompet"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/15"
              >
                Kelola dompet
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/anggaran"
                className="inline-flex h-8 items-center rounded-lg bg-white/10 px-3 text-[12px] font-semibold text-white/90 transition-colors hover:bg-white/15"
              >
                Anggaran bulan ini
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:contents">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-[11px]">
                Pemasukan
              </p>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300 sm:size-7">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  south_west
                </span>
              </span>
            </div>
            <p className="numeral mt-2.5 text-[1.05rem] leading-tight text-brand-700 dark:text-brand-300 sm:mt-3 sm:text-[1.6rem] sm:leading-none">
              {formatIDR(income)}
            </p>
            <div className="mt-2">
              <Trend pct={incomeChangePct} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:text-[11px]">
                Pengeluaran
              </p>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 sm:size-7">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                  north_east
                </span>
              </span>
            </div>
            <p className="numeral mt-2.5 text-[1.05rem] leading-tight text-foreground sm:mt-3 sm:text-[1.6rem] sm:leading-none">
              {formatIDR(expense)}
            </p>
            <div className="mt-2">
              <Trend pct={expenseChangePct} invert />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
