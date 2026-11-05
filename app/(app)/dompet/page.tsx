import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { WalletForm } from '@/components/wallet-form';
import { TransferForm } from '@/components/transfer-form';

const TYPE_META: Record<string, { label: string; icon: string }> = {
  CASH: { label: 'Tunai', icon: 'payments' },
  BANK: { label: 'Bank', icon: 'account_balance' },
  E_WALLET: { label: 'E-Wallet', icon: 'smartphone' },
};

export default async function DompetPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const [wallets, transfers] = await Promise.all([
    db.wallet.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'asc' } }),
    db.transfer.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 20 }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const total = wallets.reduce((s, w) => s + Number(w.balance), 0);
  // Dompet dengan saldo terbesar ditonjolkan (bukan sekadar yang pertama dibuat).
  const featuredId =
    wallets.length > 0
      ? wallets.reduce((a, b) => (Number(b.balance) > Number(a.balance) ? b : a)).id
      : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Judul */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Kekayaan</p>
          <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Dompet</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {wallets.length} dompet aktif · total {formatIDR(total)}
          </p>
        </div>
        <WalletForm />
      </div>

      {/* Kartu dompet — satu kartu menonjol, sisanya ringkas */}
      {wallets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => {
            const meta = TYPE_META[w.type] ?? { label: w.type, icon: 'wallet' };
            const featured = w.id === featuredId;
            return (
              <div
                key={w.id}
                className={
                  featured
                    ? 'relative overflow-hidden rounded-2xl bg-foreground p-5 text-background grain'
                    : 'rounded-2xl border border-border/70 bg-card p-5 shadow-xs'
                }
              >
                {featured && (
                  <div
                    className="absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-30 blur-3xl"
                    style={{ background: 'var(--brand-400)' }}
                  />
                )}
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`truncate text-[13.5px] font-bold ${
                        featured ? 'text-background' : 'text-foreground'
                      }`}
                    >
                      {w.name}
                    </p>
                    <p
                      className={`mt-0.5 flex items-center gap-1 text-[11px] ${
                        featured ? 'text-background/45' : 'text-muted-foreground'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>
                      {meta.label}
                    </p>
                  </div>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      featured ? 'bg-background/10 text-brand-300' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{meta.icon}</span>
                  </span>
                </div>
                <p
                  className={`numeral relative mt-4 text-[1.45rem] leading-none ${
                    featured ? 'text-background' : 'text-foreground'
                  }`}
                >
                  {formatIDR(Number(w.balance))}
                </p>
                {total > 0 && (
                  <div
                    className={`relative mt-3 h-1 w-full overflow-hidden rounded-full ${
                      featured ? 'bg-background/15' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${featured ? 'bg-brand-400' : 'bg-brand-500'}`}
                      style={{
                        width: `${Math.max(2, Math.min(100, (Number(w.balance) / total) * 100))}%`,
                      }}
                    />
                  </div>
                )}
                {total > 0 && (
                  <p
                    className={`relative mt-1.5 text-[10.5px] ${
                      featured ? 'text-background/40' : 'text-muted-foreground/80'
                    }`}
                  >
                    {((Number(w.balance) / total) * 100).toFixed(0)}% dari total
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </span>
          <h2 className="mt-3 text-[15px] font-bold">Belum ada dompet</h2>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Mulai dengan satu dompet tunai dan isi saldo hari ini. Kamu bisa menambah rekening lain nanti.
          </p>
        </div>
      )}

      {/* Transfer + riwayat */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="px-5 pt-5">
            <h2 className="text-[14.5px] font-bold">Transfer antar dompet</h2>
            <p className="text-[12px] text-muted-foreground">
              Pindahkan saldo tanpa mengubah total kekayaanmu
            </p>
          </header>
          <div className="px-5 pb-5 pt-4">
            <TransferForm
              wallets={wallets.map((w) => ({ id: w.id, name: w.name, balance: Number(w.balance) }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <header className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14.5px] font-bold">Riwayat transfer</h2>
              <p className="text-[12px] text-muted-foreground">20 perpindahan terakhir</p>
            </div>
            {transfers.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                {transfers.length}
              </span>
            )}
          </header>

          <div className="px-5 pb-5 pt-3">
            {transfers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-8 text-center">
                <p className="text-[13px] text-muted-foreground">Belum ada transfer.</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground/70">
                  Riwayat akan muncul setelah kamu memindahkan saldo.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold">
                        {walletMap.get(t.fromWalletId)?.name ?? '?'}
                        <span className="mx-1 text-muted-foreground">→</span>
                        {walletMap.get(t.toWalletId)?.name ?? '?'}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {new Date(t.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {t.note ? ` · ${t.note}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12.5px] font-bold tabular">
                      {formatIDR(Number(t.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
