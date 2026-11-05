'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { requestJson, toast } from '@/components/ui/toast';

export function CopyBudgetButton({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function copy() {
    setLoading(true);
    try {
      const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
      const result = await requestJson<{ categoryId: string; limit: string }[]>(
        `/api/budgets?month=${prev.month}&year=${prev.year}`,
        { errorTitle: 'Gagal membaca anggaran bulan lalu' },
      );
      if (!result.ok) return;

      const prevBudgets = result.data ?? [];
      if (!prevBudgets.length) {
        // Bukan kegagalan: memang belum ada data. Info, bukan error merah.
        toast.info(
          'Tidak ada anggaran untuk disalin',
          'Bulan lalu belum punya anggaran yang tercatat.',
        );
        return;
      }

      let copied = 0;
      for (const b of prevBudgets) {
        const res = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: b.categoryId, month, year, limit: Number(b.limit) }),
        });
        if (res.ok) copied++;
      }

      if (copied === 0) {
        toast.warning(
          'Tidak ada yang tersalin',
          'Semua kategori dari bulan lalu sudah punya anggaran di bulan ini.',
        );
      } else if (copied < prevBudgets.length) {
        toast.warning(
          `${copied} dari ${prevBudgets.length} anggaran tersalin`,
          'Sisanya sudah ada atau ditolak server.',
        );
      } else {
        toast.success(`${copied} anggaran disalin`, 'Dari bulan sebelumnya ke bulan ini.');
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={copy} disabled={loading}>
      {loading ? 'Menyalin...' : 'Salin dari Bulan Lalu'}
    </Button>
  );
}
