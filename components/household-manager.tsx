'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/format';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { requestJson } from '@/components/ui/toast';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}
interface SharedWallet {
  id: string;
  name: string;
  balance: number;
  type: string;
}
interface Household {
  id: string;
  name: string;
  inviteCode: string;
  isOwner: boolean;
  role: 'OWNER' | 'MEMBER';
  members: Member[];
  wallets: SharedWallet[];
}
interface Wallet {
  id: string;
  name: string;
  isShared: boolean;
}

const field =
  'h-11 w-full rounded-xl border border-input bg-card px-3 text-[14px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12';

export function HouseholdManager({
  household,
  wallets,
}: {
  household: Household | null;
  wallets: Wallet[];
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  async function post(
    url: string,
    body?: unknown,
    messages?: { success: string; error: string },
  ) {
    setError('');
    setBusy(true);
    try {
      const result = await requestJson(url, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        successTitle: messages?.success,
        errorTitle: messages?.error ?? 'Gagal memproses',
        context: { url },
      });
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  // ---------- Belum tergabung ----------
  if (!household) {
    return (
      <div className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              post(
                '/api/household',
                { name },
                { success: 'Rumah tangga dibuat', error: 'Gagal membuat rumah tangga' },
              );
            }}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
            </span>
            <h2 className="mt-3 text-[14.5px] font-bold">Buat rumah tangga</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              Buat satu ruang untuk berbagi dompet dengan pasangan atau keluarga.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rumah Tangga Kami"
              required
              minLength={2}
              maxLength={50}
              className={`${field} mt-3`}
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2.5 h-10 w-full rounded-xl bg-brand-500 text-[13px] font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? 'Membuat…' : 'Buat rumah tangga'}
            </button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              post(
                '/api/household/join',
                { inviteCode: code },
                { success: 'Berhasil bergabung', error: 'Gagal bergabung ke rumah tangga' },
              );
            }}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <span className="material-symbols-outlined text-[18px]">key</span>
            </span>
            <h2 className="mt-3 text-[14.5px] font-bold">Gabung dengan kode</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              Minta kode 8 karakter dari pemilik rumah tangga, lalu masukkan di sini.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD2345"
              required
              minLength={6}
              maxLength={12}
              className={`${field} mt-3 font-mono tracking-widest`}
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2.5 h-10 w-full rounded-xl border border-border text-[13px] font-bold transition-colors hover:bg-muted disabled:opacity-60"
            >
              {busy ? 'Memproses…' : 'Gabung'}
            </button>
          </form>
        </div>

        <p className="rounded-xl bg-muted/50 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
          Dompet pribadimu tetap pribadi. Hanya dompet yang kamu bagikan secara eksplisit yang terlihat oleh
          anggota rumah tangga.
        </p>
      </div>
    );
  }

  // ---------- Sudah tergabung ----------
  return (
    <div className="flex flex-col gap-4">
      {confirmDialog}
      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl card-ink p-5 grain">
        <div
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--brand-400)' }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/55">
              Rumah tangga
            </p>
            <h2 className="text-display mt-1 text-[1.6rem] leading-tight">{household.name}</h2>
            <p className="mt-1 text-[12px] text-white/50">
              {household.members.length} anggota · {household.wallets.length} dompet dibagikan
            </p>
          </div>
          {household.isOwner && (
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-white/50">
                Kode undangan
              </p>
              <p className="font-mono text-[15px] font-bold tracking-[0.18em] text-brand-300">
                {household.inviteCode}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Anggota */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
        <header className="px-5 pt-4">
          <h3 className="text-[14px] font-bold">Anggota</h3>
          <p className="text-[12px] text-muted-foreground">Siapa saja yang bisa melihat dompet bersama</p>
        </header>
        <ul className="divide-y divide-border/60 px-5 pb-4 pt-2">
          {household.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-700">
                {m.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight">{m.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{m.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  m.role === 'OWNER' ? 'bg-brand-50 text-brand-700' : 'bg-muted text-muted-foreground'
                }`}
              >
                {m.role === 'OWNER' ? 'Pemilik' : 'Anggota'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Dompet dibagikan */}
      <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
        <header className="px-5 pt-4">
          <h3 className="text-[14px] font-bold">Dompet dibagikan</h3>
          <p className="text-[12px] text-muted-foreground">Pilih dompet yang ingin kamu bagi</p>
        </header>
        <div className="px-5 pb-5 pt-3">
          {wallets.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-6 text-center text-[13px] text-muted-foreground">
              Belum ada dompet aktif.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {wallets.map((w) => (
                <li key={w.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{w.name}</p>
                  <button
                    onClick={() =>
                      post(
                        '/api/household/wallet',
                        { walletId: w.id, shared: !w.isShared },
                        {
                          success: w.isShared ? 'Berhenti dibagikan' : 'Dompet dibagikan',
                          error: 'Gagal mengubah status berbagi',
                        },
                      )
                    }
                    disabled={busy}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11.5px] font-bold transition-colors disabled:opacity-60 ${
                      w.isShared
                        ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {w.isShared ? 'Dibagikan' : 'Bagikan'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {household.wallets.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
          <h3 className="text-[14px] font-bold">Saldo dompet bersama</h3>
          <ul className="mt-3 space-y-2">
            {household.wallets.map((w) => (
              <li key={w.id} className="flex items-center justify-between text-[13px]">
                <span className="truncate font-medium">{w.name}</span>
                <span className="numeral shrink-0 font-bold">{formatIDR(w.balance)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={async () => {
          const ok = await confirm({
            title: household.isOwner
              ? 'Bubarkan rumah tangga ini?'
              : 'Keluar dari rumah tangga ini?',
            description: household.isOwner
              ? 'Rumah tangga dihapus dan semua dompet bersama dilepas. Dompet pribadi anggota tidak terpengaruh.'
              : 'Kamu tidak lagi melihat dompet yang dibagikan di rumah tangga ini.',
            confirmLabel: household.isOwner ? 'Bubarkan' : 'Keluar',
            destructive: true,
          });
          if (ok)
            post('/api/household/leave', undefined, {
              success: 'Kamu keluar dari rumah tangga',
              error: 'Gagal keluar dari rumah tangga',
            });
        }}
        disabled={busy}
        className="self-start rounded-xl border border-rose-500/30 px-4 py-2 text-[12.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
      >
        {household.isOwner ? 'Bubarkan rumah tangga' : 'Keluar dari rumah tangga'}
      </button>
    </div>
  );
}
