import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLabel } from '@/lib/audit';

export const metadata = { title: 'Riwayat Aktivitas' };

const ICON: Record<string, string> = {
  Budget: 'donut_small',
  Goal: 'savings',
  RecurringRule: 'event_repeat',
  Household: 'group',
  Wallet: 'account_balance_wallet',
  User: 'person',
};

function relTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AktivitasPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const logs = await db.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Kelompokkan per tanggal (bukan per jam) agar mudah dipindai.
  const groups = new Map<string, typeof logs>();
  for (const l of logs) {
    const key = l.createdAt.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const arr = groups.get(key) ?? [];
    arr.push(l);
    groups.set(key, arr);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Jejak</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Riwayat aktivitas</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {logs.length} perubahan tercatat · hanya bisa dibaca, tidak bisa diubah
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </span>
          <h2 className="mt-3 text-[15px] font-bold">Belum ada aktivitas</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Perubahan pada anggaran, target, dan rumah tangga akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {[...groups.entries()].map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {date}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
                <ul className="divide-y divide-border/60">
                  {items.map((l) => (
                    <li key={l.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <span className="material-symbols-outlined text-[16px]">
                          {ICON[l.entity] ?? 'history'}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight">{auditLabel(l.action)}</p>
                        {l.summary && (
                          <p className="truncate text-[11.5px] text-muted-foreground">{l.summary}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground/70">
                        {relTime(l.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
