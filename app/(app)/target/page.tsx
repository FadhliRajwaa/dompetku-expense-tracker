import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { GoalManager } from '@/components/goal-manager';

export const metadata = { title: 'Target Tabungan' };

export default async function TargetPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const goals = await db.goal.findMany({
    where: { userId, isArchived: false },
    orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }],
    include: { entries: { orderBy: { date: 'desc' }, take: 5 } },
  });

  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.savedAmount), 0);
  const achieved = goals.filter((g) => Number(g.savedAmount) >= Number(g.targetAmount)).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Menabung</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Target</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {goals.length > 0
            ? `${goals.length} target aktif · ${achieved} tercapai`
            : 'Sisihkan dana untuk tujuan yang kamu rencanakan'}
        </p>
      </div>

      {goals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Total terkumpul
            </p>
            <p className="numeral mt-2 text-[1.35rem] leading-none text-brand-700">
              Rp {totalSaved.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Total target
            </p>
            <p className="numeral mt-2 text-[1.35rem] leading-none">
              Rp {totalTarget.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Progres keseluruhan
            </p>
            <p className="numeral mt-2 text-[1.35rem] leading-none">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}
              <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">%</span>
            </p>
          </div>
        </div>
      )}

      <GoalManager
        goals={goals.map((g) => ({
          id: g.id,
          name: g.name,
          targetAmount: String(g.targetAmount),
          savedAmount: String(g.savedAmount),
          currency: g.currency,
          targetDate: g.targetDate ? g.targetDate.toISOString() : null,
          icon: g.icon,
          color: g.color,
          entries: g.entries.map((e) => ({
            id: e.id,
            amount: String(e.amount),
            type: e.type,
            note: e.note,
            date: e.date.toISOString(),
          })),
        }))}
      />
    </div>
  );
}
