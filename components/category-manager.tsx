'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori baru" className="sm:max-w-xs" maxLength={30} />
        <select value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')} className="h-10 rounded-lg border px-2 text-sm">
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
        </select>
        <Button onClick={add} disabled={saving} className="bg-[#2FA084] hover:bg-[#27856d] text-white w-fit">
          {saving ? 'Menambah...' : 'Tambah'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="divide-y">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              <span className="font-medium">{c.name}</span>{' '}
              <span className="text-xs text-zinc-500">{c.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</span>
            </span>
            {c.global ? (
              <Badge variant="outline">Bawaan</Badge>
            ) : (
              <Badge className="bg-[#d9f2e7] text-[#1f6b4d] hover:bg-[#d9f2e7]">Saya{c.used > 0 ? ` • dipakai ${c.used}x` : ''}</Badge>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">Kategori bawaan tidak bisa dihapus. Kategori sendiri yang sudah dipakai transaksi tidak bisa dihapus agar riwayat tetap utuh.</p>
    </div>
  );
}
