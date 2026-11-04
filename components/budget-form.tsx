'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function BudgetForm({
  categories,
  month,
  year,
}: {
  categories: { id: string; name: string }[];
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setError('');
    if (!(Number(limit) > 0)) {
      setError('Limit harus lebih dari 0');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, month, year, limit: Number(limit) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menyimpan');
        return;
      }
      setOpen(false);
      setLimit('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#2FA084] hover:bg-[#27856d] text-white">+ Tambah Budget</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Budget</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 p-4 pt-0">
          <div>
            <Label htmlFor="b-cat">Kategori</Label>
            <select id="b-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="b-limit">Limit (Rp)</Label>
            <Input id="b-limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={save} disabled={saving} className="bg-[#2FA084] hover:bg-[#27856d] text-white">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
