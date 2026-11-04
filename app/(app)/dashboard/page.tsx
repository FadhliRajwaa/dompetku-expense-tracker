import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';
import { formatIDR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryDonut } from '@/components/charts/category-donut';

function Trend({ pct, invert = false }: { pct: number; invert?: boolean }) {
  const good = invert ? pct < 0 : pct > 0;
  return (
    <span className={`text-xs font-medium ${good ? 'text-emerald-600' : 'text-zinc-500'}`}>
      {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% vs bln lalu
    </span>
  );
}

function statusBadge(s: 'aman' | 'hampir-habis' | 'melebihi') {
  if (s === 'melebihi') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Melebihi</Badge>;
  if (s === 'hampir-habis') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Hampir habis</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aman</Badge>;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const now = new Date();
  const d = await getDashboardData({ userId, month: now.getMonth() + 1, year: now.getFullYear() });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Halo, {session!.user?.name}</h1>
        <p className="text-sm text-zinc-500">Ringkasan keuangan bulan ini</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">TOTAL SALDO</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold sm:text-xl">{formatIDR(d.totalBalance)}</p>
            <p className="text-xs text-zinc-500">{d.activeWallets} dompet aktif</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">PEMASUKAN</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold text-emerald-600 sm:text-xl">{formatIDR(d.income)}</p>
            <Trend pct={d.incomeChangePct} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">PENGELUARAN</CardTitle></CardHeader>
          <CardContent><p className="text-lg font-bold text-rose-600 sm:text-xl">{formatIDR(d.expense)}</p>
            <Trend pct={d.expenseChangePct} invert /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">SISA BUDGET</CardTitle></CardHeader>
          <CardContent><p className={`text-lg font-bold sm:text-xl ${d.remainingBudget < 0 ? 'text-red-600' : ''}`}>{formatIDR(d.remainingBudget)}</p>
            <Link href="/anggaran" className="text-xs font-medium text-[#2FA084] hover:underline">Kelola →</Link></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Arus Kas 30 Hari</CardTitle></CardHeader>
          <CardContent><CashflowChart data={d.cashflow30} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pengeluaran per Kategori</CardTitle></CardHeader>
          <CardContent><CategoryDonut data={d.perCategory} /></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Budget Bulan Ini</CardTitle>
            <Link href="/anggaran" className="text-xs font-medium text-[#2FA084] hover:underline">Lihat semua →</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.budgetProgress.length === 0 && (
              <div className="text-sm text-zinc-500">
                Belum ada budget. <Link href="/anggaran" className="font-medium text-[#2FA084] hover:underline">Set target budget bulanan →</Link>
              </div>
            )}
            {d.budgetProgress.slice(0, 5).map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{b.categoryName}</span>
                  {statusBadge(b.status)}
                </div>
                <Progress value={Math.min(100, b.percent)} className="mt-1.5 h-2" />
                <p className="mt-1 text-xs text-zinc-500">{formatIDR(b.used)} / {formatIDR(b.limit)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
            <Link href="/transaksi" className="text-xs font-medium text-[#2FA084] hover:underline">Semua →</Link>
          </CardHeader>
          <CardContent>
            {d.recent.length === 0 && (
              <div className="text-sm text-zinc-500">
                Belum ada transaksi. <span className="font-medium text-[#2FA084]">Tekan + untuk catat pertama →</span>
              </div>
            )}
            <ul className="divide-y">
              {d.recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.note || (t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</p>
                    <p className="text-xs text-zinc-500">{t.wallet?.name ?? ''} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatIDR(Number(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
