'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { Select } from '@/components/ui/select-premium';
import { DatePicker } from '@/components/ui/date-picker';
import { MoneyInput, TextField } from '@/components/ui/money-input';

interface Entry {
  id: string;
  amount: string | number;
  type: 'DEPOSIT' | 'WITHDRAW';
  note: string | null;
  date: string | Date;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: string | number;
  savedAmount: string | number;
  currency: string;
  targetDate: string | Date | null;
  icon: string;
  color: string;
  entries: Entry[];
}

function daysLeft(target: string | Date | null) {
  if (!target) return null;
  const diff = Math.ceil((new Date(target).getTime() - Date.now()) / 86_400_000);
  return diff;
}

export function GoalManager({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // form buat target
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [targetDate, setTargetDate] = useState('');

  // form setor
  const [depositFor, setDepositFor] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const value = Number(target.replace(/\D/g, ''));
    if (!value) return setError('Target harus lebih dari nol');
    setBusy(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetAmount: value,
          currency,
          // `new Date('YYYY-MM-DD')` diparse sebagai UTC tengah malam; di zona
          // waktu negatif itu jatuh ke hari sebelumnya. Tambahkan waktu lokal
          // tengah hari supaya tanggal yang dipilih tetap sama.
          targetDate: targetDate ? new Date(`${targetDate}T12:00:00`).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error ?? 'Gagal membuat target');
      setName('');
      setTarget('');
      setTargetDate('');
      setOpen(false);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setBusy(false);
    }
  }

  async function addEntry(goalId: string) {
    setError('');
    const value = Number(depositAmount.replace(/\D/g, ''));
    if (!value) return setError('Nominal harus lebih dari nol');
    setBusy(true);
    try {
      const res = await fetch(`/api/goals/${goalId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, type: depositType }),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.error ?? 'Gagal menyimpan');
      setDepositAmount('');
      setDepositFor(null);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setBusy(false);
    }
  }

  async function archive(id: string) {
    if (!confirm('Arsipkan target ini? Riwayat setoran tetap tersimpan.')) return;
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {open && (
        <form
          onSubmit={createGoal}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
        >
          <h3 className="text-[14px] font-bold">Buat target tabungan</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Dana yang disisihkan tidak mengurangi saldo dompet — hanya dialokasikan.
          </p>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Nama target</span>
              <TextField
                value={name}
                onChange={setName}
                placeholder="Dana darurat"
                maxLength={50}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Nominal target</span>
              <MoneyInput
                value={target}
                onChange={setTarget}
                placeholder="0"
                currency={currency === 'IDR' ? 'Rp' : currency}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Mata uang</span>
              <Select
                value={currency}
                onValueChange={setCurrency}
                options={['IDR', 'USD', 'EUR', 'SGD', 'MYR'].map((c) => ({ value: c, label: c }))}
                aria-label="Mata uang"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold">Target tanggal (opsional)</span>
              <DatePicker
                value={targetDate}
                onChange={setTargetDate}
                clearable
                aria-label="Target tanggal"
              />
            </div>
          </div>

          {error && <p className="mt-2 text-[12px] text-rose-600">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded-xl bg-brand-500 px-4 text-[13px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? 'Menyimpan…' : 'Simpan target'}
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

      {/* Tombol buka form — mengambang di kanan atas daftar target.
          Diposisikan sebagai baris sendiri agar tidak bersaing dengan judul
          halaman, dan disembunyikan saat form terbuka. */}
      {!open && (
        <div className="flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-bold text-white shadow-sm shadow-brand-500/25 transition-colors hover:bg-brand-600"
          >
            <Plus className="size-4" aria-hidden="true" />
            Target baru
          </button>
        </div>
      )}

      {goals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </span>
          <h2 className="mt-3 text-[15px] font-bold">Belum ada target tabungan</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Tetapkan target seperti dana darurat atau liburan, lalu sisihkan dana sedikit demi sedikit.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map((g) => {
          const saved = Number(g.savedAmount);
          const targetAmt = Number(g.targetAmount);
          const pct = targetAmt > 0 ? (saved / targetAmt) * 100 : 0;
          const done = pct >= 100;
          const left = daysLeft(g.targetDate);
          const remaining = targetAmt - saved;

          return (
            <div key={g.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${g.color}18`, color: g.color }}
                  >
                    <span className="material-symbols-outlined text-[18px]">savings</span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {g.targetDate
                        ? left !== null && left >= 0
                          ? `${left} hari lagi`
                          : 'Lewat target waktu'
                        : 'Tanpa batas waktu'}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    done ? 'bg-brand-50 text-brand-700' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? 'Tercapai' : `${pct.toFixed(0)}%`}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="numeral text-[1.2rem] leading-none">
                  {formatMoney(saved, g.currency)}
                </span>
                <span className="text-[11.5px] text-muted-foreground">
                  / {formatMoney(targetAmt, g.currency)}
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${done ? 'bg-brand-500' : 'bg-brand-400'}`}
                  style={{ width: `${Math.min(100, Math.max(1.5, pct))}%` }}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {done ? 'Target tercapai' : `Kurang ${formatMoney(remaining, g.currency)}`}
              </p>

              {depositFor === g.id ? (
                <div className="mt-3 flex flex-col gap-2 rounded-xl bg-muted/50 p-2.5">
                  <div className="flex gap-1.5">
                    {(['DEPOSIT', 'WITHDRAW'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setDepositType(t)}
                        className={`flex-1 rounded-lg py-1.5 text-[11.5px] font-bold transition-colors ${
                          depositType === t
                            ? 'bg-brand-500 text-white'
                            : 'bg-card text-muted-foreground'
                        }`}
                      >
                        {t === 'DEPOSIT' ? 'Setor' : 'Tarik'}
                      </button>
                    ))}
                  </div>
                  <MoneyInput value={depositAmount} onChange={setDepositAmount} placeholder="0" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => addEntry(g.id)}
                      disabled={busy}
                      className="h-9 flex-1 rounded-lg bg-brand-500 text-[12.5px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
                    >
                      {busy ? 'Menyimpan…' : 'Simpan'}
                    </button>
                    <button
                      onClick={() => {
                        setDepositFor(null);
                        setDepositAmount('');
                      }}
                      className="h-9 rounded-lg border border-border px-3 text-[12.5px]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setDepositFor(g.id);
                      setDepositType('DEPOSIT');
                      setError('');
                    }}
                    className="h-9 flex-1 rounded-lg bg-brand-50 text-[12.5px] font-bold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    Tambah dana
                  </button>
                  <button
                    onClick={() => archive(g.id)}
                    className="h-9 rounded-lg border border-border px-3 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted"
                    aria-label={`Arsipkan ${g.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">archive</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && depositFor && <p className="text-[12px] text-rose-600">{error}</p>}
    </div>
  );
}
