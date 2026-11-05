import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { getDashboardData } from '@/lib/dashboard';
import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryDonut } from '@/components/charts/category-donut';
import { PeriodPicker } from '@/components/laporan/period-picker';
import { Reveal } from '@/components/motion/reveal';

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const q = await searchParams;
  const now = new Date();
  const [pYear, pMonth] = (q.p ?? '').split('-').map(Number);
  const month = Number(q.month ?? (pMonth >= 1 && pMonth <= 12 ? pMonth : now.getMonth() + 1));
  const year = Number(q.year ?? (pYear > 1970 ? pYear : now.getFullYear()));
  const d = await getDashboardData({ userId, month, year });

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const where: Prisma.TransactionWhereInput = { userId, date: { gte: start, lt: end } };
  if (q.walletId) where.walletId = q.walletId;
  const [wallets, txns] = await Promise.all([
    db.wallet.findMany({ where: { userId, isActive: true } }),
    db.transaction.findMany({ where, orderBy: { date: 'desc' }, take: 100 }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const csvHref = `/api/reports/export?from=${start.toISOString().slice(0, 10)}&to=${end
    .toISOString()
    .slice(0, 10)}${q.walletId ? `&walletId=${q.walletId}` : ''}&format=csv`;

  const selisih = d.income - d.expense;
  const savingRate = d.income > 0 ? (selisih / d.income) * 100 : 0;

  const METRICS = [
    {
      label: 'Pemasukan',
      value: formatIDR(d.income),
      tone: 'text-brand-700 dark:text-brand-300',
      span: '',
    },
    { label: 'Pengeluaran', value: formatIDR(d.expense), tone: 'text-foreground', span: '' },
    {
      label: 'Selisih',
      value: `${selisih >= 0 ? '+' : '−'}${formatIDR(Math.abs(selisih))}`,
      tone: selisih >= 0 ? 'text-brand-700 dark:text-brand-300' : 'text-rose-600',
      // Tiga metrik di grid dua kolom menyisakan satu lubang kosong; Selisih
      // dibuat selebar baris supaya kartu di bawahnya rata.
      span: 'col-span-2 lg:col-span-1',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
            Analisis
          </p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Laporan</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{monthName}</p>
        </div>

        {/* Di HP pemilih periode memakai satu baris penuh dan dua tombol ekspor
            berbagi baris berikutnya. Sebelumnya ketiganya berdesakan dalam satu
            baris dan tombol CSV terlempar sendirian ke baris kedua. */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <PeriodPicker month={month} year={year} walletId={q.walletId} />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <a
              href={csvHref.replace('format=csv', 'format=pdf')}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-[12.5px] font-semibold shadow-xs transition-colors hover:bg-muted"
            >
              <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
              PDF
            </a>
            <a
              href={csvHref}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              <Download className="size-4" aria-hidden="true" />
              CSV
            </a>
          </div>
        </div>
      </div>

      {/* Metrik. Dua kolom sejak HP: satu kartu selebar layar membuat empat
          angka ringkas memakan satu layar penuh sebelum grafik terlihat. */}
      <Reveal className="grid grid-cols-2 gap-3 lg:grid-cols-4" stagger={0.06}>
        {METRICS.map((m) => (
          <div
            key={m.label}
            className={`reveal-item rounded-2xl border border-border/70 bg-card p-4 shadow-xs ${m.span}`}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {m.label}
            </p>
            <p
              className={`numeral mt-2 text-[1.15rem] leading-none sm:text-[1.4rem] ${m.tone}`}
            >
              {m.value}
            </p>
          </div>
        ))}

        {/* Rasio tabungan memakai lebar penuh di HP supaya bilah kemajuannya
            terbaca sebagai skala, bukan garis pendek. */}
        <div className="reveal-item col-span-2 rounded-2xl border border-border/70 bg-card p-4 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Rasio tabungan
            </p>
            <TrendingUp className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="numeral mt-2 text-[1.4rem] leading-none">
            {savingRate.toFixed(0)}
            <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">%</span>
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                savingRate >= 20 ? 'bg-brand-500' : savingRate >= 0 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(1, savingRate))}%` }}
            />
          </div>
        </div>
      </Reveal>

      {/* Grafik */}
      <Reveal className="grid gap-3 lg:grid-cols-[1.62fr_1fr]" stagger={0.1}>
        <section className="reveal-item rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Tren arus kas</h2>
              <p className="text-[12px] text-muted-foreground">30 hari terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-500" />
                Masuk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-400" />
                Keluar
              </span>
            </div>
          </header>
          <div className="px-2 pb-3 pt-4">
            <CashflowChart data={d.cashflow30} />
          </div>
        </section>

        <section className="reveal-item rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="px-5 pt-5">
            <h2 className="text-[14.5px] font-bold">Komposisi</h2>
            <p className="text-[12px] text-muted-foreground">Pengeluaran per kategori</p>
          </header>
          <div className="px-3 pb-4 pt-2">
            <CategoryDonut data={d.perCategory} />
          </div>
        </section>
      </Reveal>

      {/* Rincian */}
      <Reveal>
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Rincian transaksi</h2>
              <p className="text-[12px] text-muted-foreground">
                {txns.length} transaksi terbaru periode ini
              </p>
            </div>
            <Link
              href="/transaksi"
              className="text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Lihat semua
            </Link>
          </header>

          <div className="px-5 pb-5 pt-3">
            {txns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Belum ada transaksi pada periode ini.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {txns.map((t) => {
                  const income = t.type === 'INCOME';
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          income
                            ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {income ? 'south_west' : 'north_east'}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">
                          {t.note || (income ? 'Pemasukan' : 'Pengeluaran')}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {new Date(t.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {walletMap.get(t.walletId) ?? ''}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[13px] font-bold tabular ${
                          income ? 'text-income' : 'text-foreground'
                        }`}
                      >
                        {income ? '+' : '−'}
                        {formatIDR(Number(t.amount))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
