'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CopyBudgetButton({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function copy() {
    setLoading(true);
    try {
      const prev = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
      const res = await fetch(`/api/budgets?month=${prev.month}&year=${prev.year}`);
      const json = await res.json();
      const prevBudgets: { categoryId: string; limit: string }[] = json.data ?? [];
      if (!prevBudgets.length) {
        alert('Tidak ada budget bulan lalu untuk disalin');
        return;
      }
      let copied = 0;
      for (const b of prevBudgets) {
        const r = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId: b.categoryId, month, year, limit: Number(b.limit) }),
        });
        if (r.ok) copied++;
      }
      alert(`${copied} budget tersalin dari bulan lalu`);
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
