'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

interface Wallet {
  id: string;
  name: string;
  balance: string;
}
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const CHIPS = [10000, 50000, 100000, 500000];

export function QuickAddSheet({ open, onOpenChange, onSaved }: QuickAddSheetProps) {
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    (async () => {
      try {
        const [w, c] = await Promise.all([
          fetch('/api/wallets').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);
        setWallets(w.data ?? []);
        setCategories(c.data ?? []);
        if (w.data?.length && !walletId) setWalletId(w.data[0].id);
      } catch {
        setError('Gagal memuat data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const filteredCats = categories.filter((c) => c.type === (tab === 'TRANSFER' ? 'EXPENSE' : tab));

  async function save() {
    setError('');
    const numAmount = Number(amount);
    if (!(numAmount > 0)) {
      setError('Nominal harus lebih dari 0');
      return;
    }
    setSaving(true);
    try {
      const res =
        tab === 'TRANSFER'
          ? await fetch('/api/transfers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fromWalletId: walletId, toWalletId, amount: numAmount, date: new Date().toISOString() }),
            })
          : await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletId,
                categoryId,
                type: tab,
                amount: numAmount,
                date: new Date().toISOString(),
                note: note || undefined,
              }),
            });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menyimpan');
        return;
      }
      setAmount('');
      setNote('');
      onOpenChange(false);
      onSaved();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Catat Transaksi</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="EXPENSE">Pengeluaran</TabsTrigger>
              <TabsTrigger value="INCOME">Pemasukan</TabsTrigger>
              <TabsTrigger value="TRANSFER">Transfer</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <Label htmlFor="qa-amount">Nominal (Rp)</Label>
            <Input
              id="qa-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className="mt-1 text-2xl font-bold h-14"
            />
            <div className="mt-2 flex gap-2">
              {CHIPS.map((c) => (
                <Button key={c} type="button" variant="outline" size="sm" onClick={() => setAmount(String((Number(amount) || 0) + c))}>
                  +{c >= 1000 ? `${c / 1000}rb` : c}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qa-wallet">{tab === 'TRANSFER' ? 'Dari dompet' : 'Dompet'}</Label>
              <select
                id="qa-wallet"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            {tab === 'TRANSFER' ? (
              <div>
                <Label htmlFor="qa-to">Ke dompet</Label>
                <select
                  id="qa-to"
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">Pilih...</option>
                  {wallets.filter((w) => w.id !== walletId).map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <Label htmlFor="qa-cat">Kategori</Label>
                <select
                  id="qa-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">Pilih...</option>
                  {filteredCats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {tab !== 'TRANSFER' && (
            <div>
              <Label htmlFor="qa-note">Catatan (opsional)</Label>
              <Input id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="cth: makan siang" maxLength={200} className="mt-1" />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={save} disabled={saving} className="bg-[#2FA084] hover:bg-[#27856d] text-white h-12 text-base">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
