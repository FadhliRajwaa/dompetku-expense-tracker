'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { requestJson } from '@/components/ui/toast';

export function TxnActions({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function remove() {
    setLoading(true);
    try {
      const result = await requestJson(`/api/transactions/${id}`, {
        method: 'DELETE',
        successTitle: 'Transaksi dihapus',
        successDescription: 'Saldo dompet sudah disesuaikan kembali.',
        errorTitle: 'Gagal menghapus transaksi',
        context: { transactionId: id },
      });
      if (result.ok) {
        setConfirming(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex gap-1">
        <Button size="sm" variant="destructive" disabled={loading} onClick={remove}>
          {loading ? '…' : 'Ya'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Batal
        </Button>
      </span>
    );
  }
  return (
    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirming(true)}>
      Hapus
    </Button>
  );
}
