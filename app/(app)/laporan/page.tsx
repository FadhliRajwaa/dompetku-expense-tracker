import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { getDashboardData } from '@/lib/dashboard';
import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryDonut } from '@/components/charts/category-donut';

function monthOptions(count = 12) {
  const now = new Date();
  const opts: { value: string; label: string; month: number; year: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    });
  }
  return opts;
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const q = await searchParams;
  const now = new Date();
  // Periode dipilih lewat <select name="p"> dengan format YYYY-MM.
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
  const csvHref = `/api/reports/export?from=${start.toISOString().slice(0, 10)}&to=${end.toISOString().slice(0, 10)}${
    q.walletId ? `&walletId=${q.walletId}` : ''
  }&format=csv`;

  const selisih = d.income - d.expense;
  const savingRate = d.income > 0 ? (selisih / d.income) * 100 : 0;
  const options = monthOptions();
  const currentValue = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Judul + aksi */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Analisis</p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Laporan</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{monthName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action="/laporan" method="get" className="flex items-center gap-2">
            <select
              name="p"
              defaultValue={currentValue}
              className="h-9 rounded-xl border border-input bg-card px-2.5 text-[12.5px] font-medium shadow-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
              aria-label="Pilih periode"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-xl border border-border bg-card px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
            >
              Tampilkan
            </button>
          </form>

          <a
            href={csvHref.replace('format=csv', 'format=pdf')}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-[12.5px] font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            PDF
          </a>
          <a
            href={csvHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            CSV
          </a>
        </div>
      </div>

      {/* Metrik kunci */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Pemasukan
          </p>
          <p className="numeral mt-2 text-[1.4rem] leading-none text-brand-700">{formatIDR(d.income)}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Pengeluaran
          </p>
          <p className="numeral mt-2 text-[1.4rem] leading-none text-foreground">{formatIDR(d.expense)}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Selisih
          </p>
          <p
            className={`numeral mt-2 text-[1.4rem] leading-none ${
              selisih >= 0 ? 'text-brand-700' : 'text-rose-600'
            }`}
          >
            {selisih >= 0 ? '+' : '−'}
            {formatIDR(Math.abs(selisih))}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Rasio tabungan
          </p>
          <p className="numeral mt-2 text-[1.4rem] leading-none text-foreground">
            {savingRate.toFixed(0)}
            <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">%</span>
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${savingRate >= 20 ? 'bg-brand-500' : savingRate >= 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(1, savingRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid gap-3 lg:grid-cols-[1.62fr_1fr]">
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Tren arus kas</h2>
              <p className="text-[12px] text-muted-foreground">30 hari terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                Masuk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Keluar
              </span>
            </div>
          </header>
          <div className="px-2 pb-3 pt-4">
            <CashflowChart data={d.cashflow30} />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="px-5 pt-5">
            <h2 className="text-[14.5px] font-bold">Komposisi</h2>
            <p className="text-[12px] text-muted-foreground">Pengeluaran per kategori</p>
          </header>
          <div className="px-3 pb-4 pt-2">
            <CategoryDonut data={d.perCategory} />
          </div>
        </section>
      </div>

      {/* Rincian */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
        <header className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
          <div>
            <h2 className="text-[14.5px] font-bold">Rincian transaksi</h2>
            <p className="text-[12px] text-muted-foreground">{txns.length} transaksi terbaru periode ini</p>
          </div>
          <Link
            href="/transaksi"
            className="text-[12px] font-semibold text-brand-600 underline-offset-4 hover:underline"
          >
            Lihat semua
          </Link>
        </header>

        <div className="px-5 pb-5 pt-3">
          {txns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center">
              <p className="text-[13px] text-muted-foreground">Belum ada transaksi pada periode ini.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {txns.map((t) => {
                const income = t.type === 'INCOME';
                return (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        income ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
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
                        {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ·{' '}
                        {walletMap.get(t.walletId) ?? ''}
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
    </div>
  );
}
