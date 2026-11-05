'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/format';

interface Rule {
  id: string;
  amount: string | number;
  note: string | null;
  type: 'INCOME' | 'EXPENSE';
  freq: string;
  interval: number;
  nextRun: string;
  status: 'ACTIVE' | 'PAUSED';
  walletName: string;
  categoryName: string;
  schedule: string;
}

interface Option {
  id: string;
  name: string;
}

const field =
  'h-11 w-full rounded-xl border border-input bg-card px-3 text-[14px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12';

const FREQ = [
  { value: 'DAILY', label: 'Harian' },
  { value: 'WEEKLY', label: 'Mingguan' },
  { value: 'MONTHLY', label: 'Bulanan' },
  { value: 'YEARLY', label: 'Tahunan' },
];

export function RecurringManager({
  rules,
  wallets,
  categories,
}: {
  rules: Rule[];
  wallets: Option[];
  categories: (Option & { type: 'INCOME' | 'EXPENSE' })[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [freq, setFreq] = useState('MONTHLY');
  const [interval, setInterval] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredCats = categories.filter((c) => c.type === type);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const value = Number(amount.replace(/\D/g, ''));
    if (!value) return setError('Nominal harus lebih dari nol');
    if (!walletId) return setError('Pilih dompet terlebih dahulu');
    const catId = categoryId || filteredCats[0]?.id;
    if (!catId) return setError('Pilih kategori terlebih dahulu');

    setBusy(true);
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId,
          categoryId: catId,
          type,
          amount: value,
          note: note || undefined,
          freq,
          interval: Number(interval) || 1,
          startDate: new Date(startDate).toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error ?? 'Gagal menyimpan');
      setOpen(false);
      setAmount('');
      setNote('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(rule: Rule) {
    const action = rule.status === 'ACTIVE' ? 'pause' : 'resume';
    const res = await fetch(`/api/recurring/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Hapus aturan ini? Transaksi yang sudah dibuat tetap tersimpan.')) return;
    const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Aturan baru
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <h3 className="text-[14px] font-bold">Transaksi berulang baru</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Otomatis dibuat dan saldo dompet disesuaikan setiap kali jatuh tempo.
          </p>

          <div className="mt-3 flex gap-1.5">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setCategoryId('');
                }}
                className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-colors ${
                  type === t ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {t === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
              </button>
            ))}
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Nominal</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500000"
                inputMode="numeric"
                required
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Dompet</span>
              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className={field}>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Kategori</span>
              <select
                value={categoryId || filteredCats[0]?.id || ''}
                onChange={(e) => setCategoryId(e.target.value)}
                className={field}
              >
                {filteredCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Catatan</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Sewa kos"
                maxLength={200}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Frekuensi</span>
              <select value={freq} onChange={(e) => setFreq(e.target.value)} className={field}>
                {FREQ.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold">Tiap</span>
                <input
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  inputMode="numeric"
                  className={field}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold">Mulai</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={field}
                />
              </label>
            </div>
          </div>

          {error && <p className="mt-2 text-[12px] text-rose-600">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded-xl bg-brand-500 px-4 text-[13px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? 'Menyimpan…' : 'Simpan aturan'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 rounded-xl border border-border px-4 text-[13px] font-medium hover:bg-muted"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-[24px]">event_repeat</span>
          </span>
          <h2 className="mt-3 text-[15px] font-bold">Belum ada transaksi berulang</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Cocok untuk gaji, sewa, langganan, atau tagihan bulanan supaya tidak perlu dicatat manual.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map((r) => {
            const income = r.type === 'INCOME';
            const paused = r.status === 'PAUSED';
            return (
              <div
                key={r.id}
                className={`flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs ${
                  paused ? 'opacity-60' : ''
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    income ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {income ? 'south_west' : 'north_east'}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight">
                    {r.note || r.categoryName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.schedule} · {r.walletName} · jatuh tempo{' '}
                    {new Date(r.nextRun).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[13px] font-bold tabular ${
                    income ? 'text-income' : 'text-foreground'
                  }`}
                >
                  {income ? '+' : '−'}
                  {formatIDR(Number(r.amount))}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggle(r)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={paused ? 'Lanjutkan' : 'Jeda'}
                    aria-label={paused ? 'Lanjutkan aturan' : 'Jeda aturan'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {paused ? 'play_arrow' : 'pause'}
                    </span>
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                    title="Hapus"
                    aria-label="Hapus aturan"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
