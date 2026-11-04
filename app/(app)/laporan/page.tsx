import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { getDashboardData } from '@/lib/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryDonut } from '@/components/charts/category-donut';

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const q = await searchParams;
  const now = new Date();
  const month = Number(q.month ?? now.getMonth() + 1);
  const year = Number(q.year ?? now.getFullYear());
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

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const csvHref = `/api/reports/export?from=${start.toISOString().slice(0, 10)}&to=${end.toISOString().slice(0, 10)}${q.walletId ? `&walletId=${q.walletId}` : ''}&format=csv`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Laporan {monthName}</h1>
          <p className="text-sm text-zinc-500">Efisiensi, tren, dan breakdown kategori</p>
        </div>
        <a href={csvHref}>
          <Button className="bg-[#2FA084] hover:bg-[#27856d] text-white">Export CSV</Button>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">PEMASUKAN</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold text-emerald-600">{formatIDR(d.income)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">PENGELUARAN</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold text-rose-600">{formatIDR(d.expense)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">SELISIH</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold">{formatIDR(d.income - d.expense)}</p></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">SISA BUDGET</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold">{formatIDR(d.remainingBudget)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Tren Arus Kas</CardTitle></CardHeader>
          <CardContent><CashflowChart data={d.cashflow30} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Komposisi</CardTitle></CardHeader>
          <CardContent><CategoryDonut data={d.perCategory} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Rincian Transaksi (100 terbaru)</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.note || (t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {walletMap.get(t.walletId) ?? ''}
                  </p>
                </div>
                <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatIDR(Number(t.amount))}
                </span>
              </li>
            ))}
          </ul>
          {txns.length === 0 && <p className="text-sm text-zinc-500">Belum ada transaksi periode ini.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
