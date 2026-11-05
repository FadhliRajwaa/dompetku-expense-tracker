import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { auth } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';
import { formatIDR } from '@/lib/format';
import { CashflowChart } from '@/components/charts/cashflow-chart';
import { CategoryDonut } from '@/components/charts/category-donut';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { Reveal } from '@/components/motion/reveal';

const STATUS = {
  aman: {
    label: 'Aman',
    cls: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    bar: 'bg-brand-500',
  },
  'hampir-habis': {
    label: 'Hampir habis',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  melebihi: {
    label: 'Melebihi',
    cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    bar: 'bg-rose-500',
  },
} as const;

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const now = new Date();
  const d = await getDashboardData({
    userId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const firstName = session!.user?.name?.split(' ')[0] ?? 'kamu';
  const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const onboarding = [
    { done: d.activeWallets > 0, label: 'Buat dompet pertama', href: '/dompet' },
    { done: d.recent.length > 0, label: 'Catat transaksi pertama', href: '/transaksi' },
    { done: d.budgetProgress.length > 0, label: 'Set anggaran bulanan', href: '/anggaran' },
  ];
  const doneCount = onboarding.filter((s) => s.done).length;
  const showOnboarding = doneCount < onboarding.length;

  return (
    <div className="flex flex-col gap-5">
      <DashboardHero
        firstName={firstName}
        monthLabel={monthLabel}
        totalBalance={d.totalBalance}
        activeWallets={d.activeWallets}
        income={d.income}
        expense={d.expense}
        incomeChangePct={d.incomeChangePct}
        expenseChangePct={d.expenseChangePct}
      />

      {/* ---------- Onboarding akun baru ---------- */}
      {showOnboarding && (
        <Reveal>
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-200/70 bg-brand-50/60 p-4 dark:border-brand-500/25 dark:bg-brand-900/25 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                <span className="material-symbols-outlined text-[18px]">flag</span>
              </span>
              <div>
                <p className="text-[13.5px] font-bold">
                  Langkah awal keuangan rapi
                  <span className="ml-2 rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
                    {doneCount} dari {onboarding.length}
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  {onboarding.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className={`flex items-center gap-1 text-[11.5px] font-medium ${
                        s.done
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.done ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="size-3.5" aria-hidden="true" />
                      )}
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href={onboarding.find((s) => !s.done)!.href}
              className="shrink-0 rounded-lg bg-brand-500 px-3.5 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-600"
            >
              Lanjutkan
            </Link>
          </div>
        </Reveal>
      )}

      {/* ---------- Grafik ---------- */}
      <Reveal className="grid gap-3 lg:grid-cols-[1.62fr_1fr]" stagger={0.1}>
        <section className="reveal-item rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Arus kas</h2>
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
            <h2 className="text-[14.5px] font-bold">Komposisi pengeluaran</h2>
            <p className="text-[12px] text-muted-foreground">Bulan ini</p>
          </header>
          <div className="px-3 pb-4 pt-2">
            <CategoryDonut data={d.perCategory} />
          </div>
        </section>
      </Reveal>

      {/* ---------- Dompet ---------- */}
      {d.wallets.length > 0 && (
        <Reveal>
          <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
            <header className="flex items-center justify-between px-5 pt-4">
              <div>
                <h2 className="text-[14.5px] font-bold">Dompet & saldo tersimpan</h2>
                <p className="text-[12px] text-muted-foreground">{d.wallets.length} dompet aktif</p>
              </div>
              <Link
                href="/dompet"
                className="flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Transfer
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </header>

            <div className="grid gap-2.5 px-5 pb-5 pt-3 sm:grid-cols-3">
              {d.wallets.slice(0, 3).map((w) => {
                const meta =
                  w.type === 'BANK'
                    ? { label: 'Bank', icon: 'account_balance' }
                    : w.type === 'E_WALLET'
                      ? { label: 'E-Wallet', icon: 'smartphone' }
                      : { label: 'Tunai', icon: 'payments' };
                const share = d.totalBalance > 0 ? (w.balance / d.totalBalance) * 100 : 0;
                return (
                  <div
                    key={w.id}
                    className="rounded-xl border border-border/60 bg-background/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                        <span className="material-symbols-outlined text-[15px]">{meta.icon}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold leading-tight">{w.name}</p>
                        <p className="text-[10px] text-muted-foreground">{meta.label}</p>
                      </div>
                      {share >= 50 && (
                        <span className="shrink-0 rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="numeral mt-2.5 text-[15px] leading-none">
                      {formatIDR(w.balance)}
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${Math.max(2, Math.min(100, share))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- Anggaran + transaksi ---------- */}
      <Reveal className="grid gap-3 lg:grid-cols-2" stagger={0.1}>
        <section className="reveal-item rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Anggaran bulan ini</h2>
              <p className="text-[12px] text-muted-foreground">Sisa {formatIDR(d.remainingBudget)}</p>
            </div>
            <Link
              href="/anggaran"
              className="text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Kelola
            </Link>
          </header>

          <div className="space-y-3.5 px-5 pb-5 pt-4">
            {d.budgetProgress.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-6 text-center">
                <p className="text-[13px] text-muted-foreground">Belum ada anggaran bulan ini.</p>
                <Link
                  href="/anggaran"
                  className="mt-1.5 inline-block text-[13px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Set anggaran pertama →
                </Link>
              </div>
            )}

            {d.budgetProgress.slice(0, 5).map((b) => {
              const st = STATUS[b.status] ?? STATUS.aman;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold">{b.categoryName}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${st.bar}`}
                      style={{ width: `${Math.min(100, Math.max(1.5, b.percent))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11.5px] tabular text-muted-foreground">
                    <span className="font-semibold text-foreground/80">{formatIDR(b.used)}</span>
                    {' dari '}
                    {formatIDR(b.limit)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="reveal-item rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Transaksi terakhir</h2>
              <p className="text-[12px] text-muted-foreground">5 aktivitas terbaru</p>
            </div>
            <Link
              href="/transaksi"
              className="text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Semua
            </Link>
          </header>

          <div className="px-5 pb-5 pt-3">
            {d.recent.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-6 text-center">
                <p className="text-[13px] text-muted-foreground">Belum ada transaksi.</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground/70">
                  Tekan tombol + untuk mencatat yang pertama.
                </p>
              </div>
            )}

            <ul className="divide-y divide-border/70">
              {d.recent.map((t) => {
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
                        {t.wallet?.name ?? ''} ·{' '}
                        {new Date(t.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
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
          </div>
        </section>
      </Reveal>

      {/* ---------- Saran cerdas ---------- */}
      {(() => {
        const nearLimit = d.budgetProgress.find((b) => b.status === 'hampir-habis');
        const over = d.budgetProgress.find((b) => b.status === 'melebihi');
        const daysLeft = Math.max(
          0,
          new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
        );
        const dailyBudget = daysLeft > 0 ? d.remainingBudget / daysLeft : d.remainingBudget;

        let text: string;
        let cta: { href: string; label: string } | null = null;

        if (over) {
          text = `Anggaran ${over.categoryName} sudah melebihi batas sebesar ${formatIDR(
            Math.abs(over.limit - over.used),
          )}. Kurangi pengeluaran kategori ini agar sisanya tidak ikut tergerus.`;
          cta = { href: '/anggaran', label: 'Atur anggaran' };
        } else if (nearLimit) {
          text = `${nearLimit.categoryName} sudah terpakai ${nearLimit.percent.toFixed(
            0,
          )}%. Sisa anggaran total ${formatIDR(d.remainingBudget)} untuk ${daysLeft} hari lagi — sekitar ${formatIDR(
            Math.max(0, dailyBudget),
          )} per hari.`;
          cta = { href: '/anggaran', label: 'Lihat detail' };
        } else if (d.budgetProgress.length === 0) {
          text =
            'Belum ada anggaran bulan ini. Menetapkan batas per kategori membuat pengeluaran lebih terkendali sejak awal bulan.';
          cta = { href: '/anggaran', label: 'Buat anggaran' };
        } else {
          text = `Semua kategori masih dalam batas anggaran. Sisa ${formatIDR(
            d.remainingBudget,
          )} untuk ${daysLeft} hari lagi — sekitar ${formatIDR(Math.max(0, dailyBudget))} per hari.`;
        }

        return (
          <Reveal>
            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Lightbulb className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold">Saran DompetKu</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{text}</p>
              </div>
              {cta && (
                <Link
                  href={cta.href}
                  className="hidden shrink-0 self-center rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors hover:bg-muted sm:block"
                >
                  {cta.label}
                </Link>
              )}
            </div>
          </Reveal>
        );
      })()}
    </div>
  );
}
