import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { getBudgetStatus } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BudgetForm } from '@/components/budget-form';
import { CopyBudgetButton } from '@/components/copy-budget-button';

function statusBadge(s: 'aman' | 'hampir-habis' | 'melebihi') {
  if (s === 'melebihi') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Melebihi</Badge>;
  if (s === 'hampir-habis') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Hampir habis</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aman</Badge>;
}

export default async function AnggaranPage({
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
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [budgets, categories] = await Promise.all([
    db.budget.findMany({ where: { userId, month, year } }),
    db.category.findMany({ where: { OR: [{ userId }, { userId: null }] } }),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const sums = budgets.length
    ? await db.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, categoryId: { in: budgets.map((b) => b.categoryId) }, type: 'EXPENSE', date: { gte: start, lt: end } },
        _sum: { amount: true },
      })
    : [];
  const usedByCat = new Map(sums.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));

  const rows = budgets
    .map((b) => {
      const used = usedByCat.get(b.categoryId) ?? 0;
      const limit = Number(b.limit);
      const percent = limit > 0 ? (used / limit) * 100 : 0;
      return { ...b, limit, used, percent, status: getBudgetStatus(percent), cat: catById.get(b.categoryId) };
    })
    .sort((a, b) => b.percent - a.percent);

  const totalLimit = rows.reduce((s, r) => s + r.limit, 0);
  const totalUsed = rows.reduce((s, r) => s + r.used, 0);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Anggaran {monthName}</h1>
          <p className="text-sm text-zinc-500">
            Terpakai {formatIDR(totalUsed)} dari {formatIDR(totalLimit)}
          </p>
        </div>
        <div className="flex gap-2">
          <CopyBudgetButton month={month} year={year} />
          <BudgetForm categories={categories.filter((c) => c.type === 'EXPENSE').map((c) => ({ id: c.id, name: c.name }))} month={month} year={year} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-base">{r.cat?.name ?? '-'}</CardTitle>
              {statusBadge(r.status)}
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{formatIDR(r.used)} <span className="text-sm font-normal text-zinc-500">/ {formatIDR(r.limit)}</span></p>
              <Progress value={Math.min(100, r.percent)} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-zinc-500">{r.percent.toFixed(1)}% terpakai • sisa {formatIDR(r.limit - r.used)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {rows.length === 0 && (
        <Card>
          <CardContent className="p-4 text-sm text-zinc-500">
            Belum ada budget bulan ini. Klik &quot;Tambah Budget&quot; atau salin dari bulan lalu.
          </CardContent>
        </Card>
      )}
      <div>
        <Link href="/dashboard"><Button variant="outline" size="sm">← Kembali ke Dashboard</Button></Link>
      </div>
    </div>
  );
}
