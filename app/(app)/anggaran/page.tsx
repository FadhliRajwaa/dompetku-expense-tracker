import { AlertTriangle, CheckCircle2, CircleDollarSign, Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { getBudgetStatus } from '@/lib/finance';
import { BudgetForm } from '@/components/budget-form';
import { CopyBudgetButton } from '@/components/copy-budget-button';
import { Reveal } from '@/components/motion/reveal';

const STATUS = {
  aman: {
    label: 'Aman',
    pill: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    bar: 'bg-brand-500',
  },
  'hampir-habis': {
    label: 'Hampir habis',
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  melebihi: {
    label: 'Melebihi',
    pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    bar: 'bg-rose-500',
  },
} as const;

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
        where: {
          userId,
          categoryId: { in: budgets.map((b) => b.categoryId) },
          type: 'EXPENSE',
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      })
    : [];
  const usedByCat = new Map(sums.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));

  const rows = budgets
    .map((b) => {
      const used = usedByCat.get(b.categoryId) ?? 0;
      const limit = Number(b.limit);
      const percent = limit > 0 ? (used / limit) * 100 : 0;
      return {
        ...b,
        limit,
        used,
        percent,
        status: getBudgetStatus(percent),
        cat: catById.get(b.categoryId),
      };
    })
    .sort((a, b) => b.percent - a.percent);

  const totalLimit = rows.reduce((s, r) => s + r.limit, 0);
  const totalUsed = rows.reduce((s, r) => s + r.used, 0);
  const totalPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
  const overCount = rows.filter((r) => r.status === 'melebihi').length;
  const nearCount = rows.filter((r) => r.status === 'hampir-habis').length;
  const daysLeft = Math.max(0, new Date(year, month, 0).getDate() - now.getDate());

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
            Anggaran
          </p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">
            {monthName}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{rows.length} kategori dipantau</p>
        </div>
        <div className="flex gap-2">
          <CopyBudgetButton month={month} year={year} />
          <BudgetForm
            categories={categories
              .filter((c) => c.type === 'EXPENSE')
              .map((c) => ({ id: c.id, name: c.name }))}
            month={month}
            year={year}
          />
        </div>
      </div>

      {/* Ringkasan */}
      {rows.length > 0 && (
        <Reveal>
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Total terpakai
                </p>
                <p className="numeral mt-1.5 text-[1.9rem] leading-none">
                  {formatIDR(totalUsed)}
                  <span className="ml-2 text-[14px] font-medium text-muted-foreground">
                    / {formatIDR(totalLimit)}
                  </span>
                </p>
                <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                  Sisa{' '}
                  <span className="font-semibold text-foreground">
                    {formatIDR(totalLimit - totalUsed)}
                  </span>{' '}
                  untuk {daysLeft} hari lagi
                </p>
              </div>

              <div className="flex gap-5 text-[12px]">
                <div>
                  <p className="text-[1.3rem] font-bold leading-none">{rows.length}</p>
                  <p className="mt-1 text-muted-foreground">Kategori</p>
                </div>
                <div className="border-l border-border pl-5">
                  <p className="text-[1.3rem] font-bold leading-none text-amber-600 dark:text-amber-400">
                    {nearCount}
                  </p>
                  <p className="mt-1 text-muted-foreground">Hampir habis</p>
                </div>
                <div className="border-l border-border pl-5">
                  <p className="text-[1.3rem] font-bold leading-none text-rose-600 dark:text-rose-400">
                    {overCount}
                  </p>
                  <p className="mt-1 text-muted-foreground">Melebihi</p>
                </div>
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  totalPct > 100 ? 'bg-rose-500' : totalPct >= 80 ? 'bg-amber-500' : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(1, totalPct))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11.5px] font-medium text-muted-foreground">
              {totalPct.toFixed(1)}% dari total anggaran
            </p>
          </div>
        </Reveal>
      )}

      {/* Daftar */}
      {rows.length > 0 ? (
        <Reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {rows.map((r) => {
            const st = STATUS[r.status] ?? STATUS.aman;
            const remaining = r.limit - r.used;
            return (
              <div
                key={r.id}
                className="reveal-item rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `${r.cat?.color ?? '#2FA084'}18`,
                        color: r.cat?.color ?? '#2FA084',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {r.cat?.icon ?? 'category'}
                      </span>
                    </span>
                    <p className="truncate text-[13.5px] font-bold">{r.cat?.name ?? '—'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${st.pill}`}>
                    {st.label}
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline gap-1.5">
                  <span className="numeral text-[1.25rem] leading-none">{formatIDR(r.used)}</span>
                  <span className="text-[11.5px] text-muted-foreground">/ {formatIDR(r.limit)}</span>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${st.bar}`}
                    style={{ width: `${Math.min(100, Math.max(1.5, r.percent))}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">
                    {r.percent.toFixed(1)}% terpakai
                  </span>
                  <span
                    className={
                      remaining < 0
                        ? 'font-semibold text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground'
                    }
                  >
                    {remaining < 0
                      ? `Lewat ${formatIDR(Math.abs(remaining))}`
                      : `Sisa ${formatIDR(remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </Reveal>
      ) : (
        <Reveal>
          <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CircleDollarSign className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-[15px] font-bold">Belum ada anggaran bulan ini</h2>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Tetapkan batas pengeluaran per kategori agar kamu tahu lebih awal ketika anggaran mulai
              menipis.
            </p>
            <p className="mt-3 flex items-center justify-center gap-1 text-[12.5px] text-muted-foreground/70">
              <Plus className="size-3.5" aria-hidden="true" />
              Pakai tombol Tambah anggaran di atas, atau salin susunan bulan lalu.
            </p>
          </div>
        </Reveal>
      )}

      {/* Peringatan ringkas */}
      {overCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-500/25 dark:bg-rose-950/30">
          <AlertTriangle
            className="mt-px size-4 shrink-0 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
          <p className="text-[12.5px] leading-relaxed text-rose-800 dark:text-rose-200">
            {overCount} kategori sudah melewati batas bulan ini. Pertimbangkan menyesuaikan anggaran
            atau menahan pengeluaran sampai akhir bulan.
          </p>
        </div>
      )}

      {overCount === 0 && nearCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-500/25 dark:bg-amber-950/30">
          <AlertTriangle
            className="mt-px size-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <p className="text-[12.5px] leading-relaxed text-amber-800 dark:text-amber-200">
            {nearCount} kategori hampir mencapai batas. Sisa {daysLeft} hari — jaga laju pengeluaran.
          </p>
        </div>
      )}

      {overCount === 0 && nearCount === 0 && rows.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50/70 p-3.5 dark:border-brand-500/25 dark:bg-brand-900/25">
          <CheckCircle2
            className="mt-px size-4 shrink-0 text-brand-600 dark:text-brand-400"
            aria-hidden="true"
          />
          <p className="text-[12.5px] leading-relaxed text-brand-800 dark:text-brand-200">
            Semua kategori masih dalam batas. Pertahankan sampai akhir bulan.
          </p>
        </div>
      )}
    </div>
  );
}
