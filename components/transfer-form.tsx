'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select-premium';
import { FieldLabel, MoneyInput, TextField } from '@/components/ui/money-input';
import { formatIDR } from '@/lib/format';
import { requestJson } from '@/components/ui/toast';

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
      setError('Nominal harus lebih dari nol.');
      return;
    }
    if (!fromId || !toId) {
      setError('Pilih dompet asal dan tujuan.');
      return;
    }
    if (fromId === toId) {
      setError('Dompet asal dan tujuan harus berbeda.');
      return;
    }
    setSaving(true);
    try {
      const result = await requestJson('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWalletId: fromId,
          toWalletId: toId,
          amount: num,
          date: new Date().toISOString(),
          note: note.trim() || undefined,
        }),
        successTitle: 'Transfer berhasil',
        successDescription: `${formatIDR(num)} dipindahkan antar dompet.`,
        errorTitle: 'Transfer gagal',
        context: { fromId, toId },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAmount('');
      setNote('');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const options = wallets.map((w) => ({
    value: w.id,
    label: w.name,
    hint: formatIDR(w.balance),
  }));
  const disabled = wallets.length < 2;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Dari</FieldLabel>
          <Select
            value={fromId}
            onValueChange={(v) => {
              setFromId(v);
              if (toId === v) setToId('');
            }}
            options={options}
            placeholder="Pilih dompet"
            aria-label="Dari dompet"
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Ke</FieldLabel>
          <Select
            value={toId}
            onValueChange={setToId}
            options={options.filter((w) => w.value !== fromId)}
            placeholder="Pilih tujuan"
            aria-label="Ke dompet"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="t-amount">Nominal</FieldLabel>
        <MoneyInput id="t-amount" value={amount} onChange={setAmount} placeholder="0" />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="t-note" optional>
          Catatan
        </FieldLabel>
        <TextField
          id="t-note"
          value={note}
          onChange={setNote}
          placeholder="cth: top up GoPay"
          maxLength={200}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {error}
        </p>
      )}

      <Button
        onClick={save}
        disabled={saving || disabled}
        className="h-11 w-full gap-1.5 rounded-xl bg-brand-500 text-[13.5px] font-bold text-white hover:bg-brand-600"
      >
        <ArrowLeftRight className="size-4" aria-hidden="true" />
        {saving ? 'Memproses…' : 'Transfer sekarang'}
      </Button>

      {disabled && (
        <p className="text-[11.5px] text-muted-foreground">
          Butuh minimal dua dompet aktif untuk melakukan transfer.
        </p>
      )}
    </div>
  );
}
