'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function WalletForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('CASH');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setError('');
    if (name.trim().length < 2) {
      setError('Nama dompet minimal 2 karakter');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, balance: Number(balance) || 0 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menyimpan');
        return;
      }
      setOpen(false);
      setName('');
      setBalance('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#2FA084] hover:bg-[#27856d] text-white">+ Tambah Dompet</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Dompet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 p-4 pt-0">
          <div>
            <Label htmlFor="w-name">Nama dompet</Label>
            <Input id="w-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth: Cash, BCA, GoPay" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="w-type">Tipe</Label>
            <select id="w-type" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm">
              <option value="CASH">Tunai (Cash)</option>
              <option value="BANK">Bank</option>
              <option value="E_WALLET">E-Wallet</option>
            </select>
          </div>
          <div>
            <Label htmlFor="w-balance">Saldo awal (Rp)</Label>
            <Input id="w-balance" inputMode="numeric" value={balance} onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" className="mt-1" />
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
