import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { describeRule, runDueRecurring, type Freq } from '@/lib/recurring';
import { RecurringManager } from '@/components/recurring-manager';

export const metadata = { title: 'Transaksi Berulang' };

export default async function BerulangPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  // Pastikan yang jatuh tempo sudah dijalankan sebelum halaman dirender.
  await runDueRecurring(userId).catch(() => 0);

  const [rules, wallets, categories] = await Promise.all([
    db.recurringRule.findMany({ where: { userId }, orderBy: [{ status: 'asc' }, { nextRun: 'asc' }] }),
    db.wallet.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'asc' } }),
    db.category.findMany({ where: { OR: [{ userId }, { userId: null }] }, orderBy: { name: 'asc' } }),
  ]);

  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const active = rules.filter((r) => r.status === 'ACTIVE').length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Otomatis</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Transaksi berulang</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {rules.length > 0 ? `${active} aktif dari ${rules.length} aturan` : 'Catat sekali, berjalan otomatis'}
        </p>
      </div>

      <RecurringManager
        rules={rules.map((r) => ({
          id: r.id,
          amount: String(r.amount),
          note: r.note,
          type: r.type,
          freq: r.freq,
          interval: r.interval,
          nextRun: r.nextRun.toISOString(),
          status: r.status,
          walletName: walletMap.get(r.walletId) ?? '—',
          categoryName: catMap.get(r.categoryId) ?? '—',
          schedule: describeRule(r.freq as Freq, r.interval),
        }))}
        wallets={wallets.map((w) => ({ id: w.id, name: w.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
      />
    </div>
  );
}
