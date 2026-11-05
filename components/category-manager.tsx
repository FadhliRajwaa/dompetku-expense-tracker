'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface C {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  global: boolean;
  used: number;
}

export function CategoryManager({ categories }: { categories: C[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function add() {
    setError('');
    if (name.trim().length < 2) {
      setError('Nama kategori minimal 2 karakter');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menambah');
        return;
      }
      setName('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori baru"
          className="h-10 sm:max-w-xs"
          maxLength={30}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
          className="h-10 rounded-xl border border-input bg-card px-2.5 text-[13px] shadow-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
        >
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
        </select>
        <Button
          onClick={add}
          disabled={saving}
          className="h-10 w-fit bg-brand-500 text-[13px] font-semibold text-white hover:bg-brand-600"
        >
          {saving ? 'Menambah…' : 'Tambah'}
        </Button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <ul className="divide-y divide-border/60">
        {categories.map((c) => {
          const income = c.type === 'INCOME';
          return (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  income ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {income ? 'south_west' : 'north_east'}
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {income ? 'Pemasukan' : 'Pengeluaran'}
                  {c.used > 0 && ` · dipakai ${c.used}×`}
                </p>
              </div>

              {c.global ? (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  Bawaan
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  Milikmu
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">Kategori bawaan tidak bisa dihapus. Kategori sendiri yang sudah dipakai transaksi tidak bisa dihapus agar riwayat tetap utuh.</p>
    </div>
  );
}
