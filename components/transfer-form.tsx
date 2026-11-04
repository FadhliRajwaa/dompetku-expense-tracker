'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatIDR } from '@/lib/format';

interface W {
  id: string;
  name: string;
  balance: number;
}

export function TransferForm({ wallets }: { wallets: W[] }) {
  const router = useRouter();
  const [fromId, setFromId] = useState(wallets[0]?.id ?? '');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setError('');
    const num = Number(amount);
    if (!(num > 0)) {
      setError('Nominal harus lebih dari 0');
      return;
    }
    if (!fromId || !toId) {
      setError('Pilih dompet asal dan tujuan');
      return;
    }
    if (fromId === toId) {
      setError('Dompet asal dan tujuan harus berbeda');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromWalletId: fromId, toWalletId: toId, amount: num, date: new Date().toISOString(), note: note || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal transfer');
        return;
      }
      setAmount('');
      setNote('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="t-from">Dari</Label>
          <select id="t-from" value={fromId} onChange={(e) => setFromId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm">
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="t-to">Ke</Label>
          <select id="t-to" value={toId} onChange={(e) => setToId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm">
            <option value="">Pilih...</option>
            {wallets.filter((w) => w.id !== fromId).map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="t-amount">Nominal (Rp)</Label>
        <Input id="t-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="t-note">Catatan (opsional)</Label>
        <Input id="t-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: top up GoPay" maxLength={200} className="mt-1" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={save} disabled={saving || wallets.length < 2} className="bg-[#2FA084] hover:bg-[#27856d] text-white">
        {saving ? 'Memproses...' : 'Transfer'}
      </Button>
      {wallets.length < 2 && <p className="text-xs text-zinc-500">Butuh minimal 2 dompet aktif untuk transfer.</p>}
    </div>
  );
}
