import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TxnActions } from '@/components/txn-actions';

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
  const keep = (k: string, v: string) => {
    const clean: Record<string, string> = {};
    for (const [key, val] of Object.entries(q)) if (val) clean[key] = val;
    clean[k] = v;
    const p = new URLSearchParams(clean);
    return `/transaksi?${p.toString()}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Transaksi</h1>
          <p className="text-sm text-zinc-500">{total} transaksi</p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap">
          <form action="/transaksi" method="get" className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <input name="q" defaultValue={q.q ?? ''} placeholder="Cari catatan..." className="h-10 rounded-lg border px-3 text-sm" />
            <select name="type" defaultValue={q.type ?? ''} className="h-10 rounded-lg border px-2 text-sm">
              <option value="">Semua tipe</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
            </select>
            <select name="walletId" defaultValue={q.walletId ?? ''} className="h-10 rounded-lg border px-2 text-sm">
              <option value="">Semua dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <Button type="submit" className="bg-[#2FA084] hover:bg-[#27856d] text-white">Filter</Button>
            {(q.q || q.type || q.walletId || q.categoryId) && (
              <Link href="/transaksi"><Button type="button" variant="outline">Reset</Button></Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Daftar */}
      <Card className="hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-zinc-500">
              <th className="p-3">Tanggal</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3">Dompet</th>
              <th className="p-3 text-right">Nominal</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="p-3">
                  <span className="font-medium">{t.note || (t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</span>
                  <span className="ml-2 text-xs text-zinc-500">{catMap.get(t.categoryId)?.name ?? ''}</span>
                </td>
                <td className="p-3 text-zinc-500">{walletMap.get(t.walletId)?.name ?? ''}</td>
                <td className={`p-3 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatIDR(Number(t.amount))}
                </td>
                <td className="p-3"><TxnActions id={t.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-col gap-2 sm:hidden">
        {items.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.note || (t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</p>
                <p className="text-xs text-zinc-500">{catMap.get(t.categoryId)?.name ?? ''} • {walletMap.get(t.walletId)?.name ?? ''}</p>
                <p className="text-xs text-zinc-400">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatIDR(Number(t.amount))}
                </span>
                <TxnActions id={t.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Belum ada transaksi</CardTitle></CardHeader>
          <CardContent className="text-sm text-zinc-500">Tekan tombol + untuk mencatat transaksi pertama.</CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500">Hal {page} / {pages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={keep('page', String(page - 1))}><Button variant="outline" size="sm">‹ Sebelumnya</Button></Link>}
          {page < pages && <Link href={keep('page', String(page + 1))}><Button variant="outline" size="sm">Berikutnya ›</Button></Link>}
        </div>
      </div>
    </div>
  );
}
