'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select-premium';
import { FieldError, FieldLabel, MoneyInput, TextField } from '@/components/ui/money-input';

const TYPES = [
  { value: 'CASH', label: 'Tunai', icon: 'payments' },
  { value: 'BANK', label: 'Rekening bank', icon: 'account_balance' },
  { value: 'E_WALLET', label: 'E-Wallet', icon: 'smartphone' },
];

export function WalletForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('CASH');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setBalance('');
    setType('CASH');
    setNameError('');
    setError('');
  }

  async function save() {
    setError('');
    if (name.trim().length < 2) {
      setNameError('Nama dompet minimal 2 karakter.');
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, balance: Number(balance) || 0 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menyimpan dompet.');
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="h-9 gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white hover:bg-brand-600">
            <Plus className="size-4" aria-hidden="true" />
            Tambah dompet
          </Button>
        }
      />
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-display text-[1.35rem]">Tambah dompet</DialogTitle>
          <p className="text-[12.5px] text-muted-foreground">
            Satu dompet untuk tiap sumber uang — tunai, rekening, atau e-wallet.
          </p>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="w-name">Nama dompet</FieldLabel>
            <TextField
              id="w-name"
              value={name}
              onChange={(v) => {
                setName(v);
                setNameError('');
              }}
              placeholder="cth: Tunai, BCA, GoPay"
              maxLength={50}
              invalid={Boolean(nameError)}
              autoFocus
            />
            <FieldError message={nameError} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tipe dompet</FieldLabel>
            <Select
              value={type}
              onValueChange={setType}
              options={TYPES}
              aria-label="Tipe dompet"
              size="md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="w-balance" optional>
              Saldo awal
            </FieldLabel>
            <MoneyInput id="w-balance" value={balance} onChange={setBalance} placeholder="0" />
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              Isi sesuai saldo hari ini. Boleh dikosongkan dan diperbarui lewat transaksi.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {error}
            </p>
          )}

          <DialogActions>
            <Button
              onClick={save}
              disabled={saving}
              className="h-11 w-full rounded-xl bg-brand-500 text-[13.5px] font-bold text-white hover:bg-brand-600"
            >
              {saving ? 'Menyimpan…' : 'Simpan dompet'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
