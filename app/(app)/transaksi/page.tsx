import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { TxnActions } from '@/components/txn-actions';

const inputCls =
  'h-10 rounded-xl border border-input bg-card px-3 text-[13px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12';

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const q = await searchParams;
  const page = Math.max(1, Number(q.page ?? 1));
  const limit = 20;

  const where: Prisma.TransactionWhereInput = { userId };
  if (q.type === 'INCOME' || q.type === 'EXPENSE') where.type = q.type;
  if (q.walletId) where.walletId = q.walletId;
  if (q.categoryId) where.categoryId = q.categoryId;
  if (q.from || q.to) {
    where.date = {};
    if (q.from) (where.date as Prisma.DateTimeFilter).gte = new Date(q.from);
    if (q.to) (where.date as Prisma.DateTimeFilter).lte = new Date(q.to);
  }
  if (q.q) where.note = { contains: q.q, mode: 'insensitive' };

  const [items, total, wallets, categories] = await Promise.all([
    db.transaction.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
    db.transaction.count({ where }),
    db.wallet.findMany({ where: { userId, isActive: true } }),
    db.category.findMany({ where: { OR: [{ userId }, { userId: null }] }, orderBy: { name: 'asc' } }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const pages = Math.max(1, Math.ceil(total / limit));
  const hasFilter = Boolean(q.q || q.type || q.walletId || q.categoryId);

  const keep = (k: string, v: string) => {
    const clean: Record<string, string> = {};
    for (const [key, val] of Object.entries(q)) if (val) clean[key] = val;
    clean[k] = v;
    return `/transaksi?${new URLSearchParams(clean).toString()}`;
  };

  // Ringkasan periode yang sedang tampil (bukan seluruh riwayat)
  const sumIn = items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const sumOut = items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Judul */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Riwayat</p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Transaksi</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {total} transaksi tercatat
            {hasFilter && ' · sesuai filter'}
          </p>
        </div>
      </div>

      {/* Ringkasan halaman ini */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Masuk (halaman ini)
          </p>
          <p className="numeral mt-1 text-[17px] text-brand-700">{formatIDR(sumIn)}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-xs">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Keluar (halaman ini)
          </p>
          <p className="numeral mt-1 text-[17px] text-foreground">{formatIDR(sumOut)}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-xs sm:col-span-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Selisih
          </p>
          <p
            className={`numeral mt-1 text-[17px] ${sumIn - sumOut >= 0 ? 'text-brand-700' : 'text-rose-600'}`}
          >
            {sumIn - sumOut >= 0 ? '+' : '−'}
            {formatIDR(Math.abs(sumIn - sumOut))}
          </p>
        </div>
      </div>

      {/* Filter */}
      <form
        action="/transaksi"
        method="get"
        className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs sm:flex-row sm:flex-wrap sm:items-center"
      >
        <div className="relative flex-1 sm:min-w-[190px]">
          <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-muted-foreground/70">
            search
          </span>
          <input
            name="q"
            defaultValue={q.q ?? ''}
            placeholder="Cari catatan transaksi…"
            className={`${inputCls} w-full pl-9`}
            aria-label="Cari catatan"
          />
        </div>

        <select name="type" defaultValue={q.type ?? ''} className={inputCls} aria-label="Tipe transaksi">
          <option value="">Semua tipe</option>
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
        </select>

        <select name="walletId" defaultValue={q.walletId ?? ''} className={inputCls} aria-label="Dompet">
          <option value="">Semua dompet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-10 flex-1 rounded-xl bg-brand-500 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 sm:flex-none"
          >
            Terapkan
          </button>
          {hasFilter && (
            <Link
              href="/transaksi"
              className="flex h-10 items-center justify-center rounded-xl border border-border px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Tabel desktop */}
      {items.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs sm:block">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-left">
                <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Tanggal
                </th>
                <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Keterangan
                </th>
                <th className="px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Dompet
                </th>
                <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Nominal
                </th>
                <th className="px-4 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((t) => {
                const income = t.type === 'INCOME';
                const cat = catMap.get(t.categoryId);
                return (
                  <tr key={t.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-muted-foreground">
                      {new Date(t.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            income ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {income ? 'south_west' : 'north_east'}
                          </span>
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {t.note || (income ? 'Pemasukan' : 'Pengeluaran')}
                          </p>
                          {cat && (
                            <p className="truncate text-[11.5px] text-muted-foreground">{cat.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                      {walletMap.get(t.walletId)?.name ?? '—'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right text-[13px] font-bold tabular ${
                        income ? 'text-income' : 'text-foreground'
                      }`}
                    >
                      {income ? '+' : '−'}
                      {formatIDR(Number(t.amount))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TxnActions id={t.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Kartu mobile */}
      <div className="flex flex-col gap-2 sm:hidden">
        {items.map((t) => {
          const income = t.type === 'INCOME';
          const cat = catMap.get(t.categoryId);
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  income ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {income ? 'south_west' : 'north_east'}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight">
                  {t.note || (income ? 'Pemasukan' : 'Pengeluaran')}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {cat?.name ?? ''} · {walletMap.get(t.walletId)?.name ?? ''}
                </p>
                <p className="text-[10.5px] text-muted-foreground/70">
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`text-[13px] font-bold tabular ${income ? 'text-income' : 'text-foreground'}`}
                >
                  {income ? '+' : '−'}
                  {formatIDR(Number(t.amount))}
                </span>
                <TxnActions id={t.id} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Kosong */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </span>
          <h2 className="mt-3 text-[15px] font-bold">
            {hasFilter ? 'Tidak ada yang cocok' : 'Belum ada transaksi'}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {hasFilter
              ? 'Coba ubah kata kunci atau hapus filter.'
              : 'Tekan tombol + di navigasi untuk mencatat yang pertama.'}
          </p>
          {hasFilter && (
            <Link
              href="/transaksi"
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-border px-4 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              Hapus filter
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] text-muted-foreground">
            Halaman <span className="font-semibold text-foreground">{page}</span> dari {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={keep('page', String(page - 1))}
                className="flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
              >
                <span className="material-symbols-outlined text-[17px]">chevron_left</span>
                Sebelumnya
              </Link>
            ) : null}
            {page < pages ? (
              <Link
                href={keep('page', String(page + 1))}
                className="flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium transition-colors hover:bg-muted"
              >
                Berikutnya
                <span className="material-symbols-outlined text-[17px]">chevron_right</span>
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
