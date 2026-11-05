'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/select-premium';

/** Periode bulanan: gabungan panah cepat + dropdown bulan. */
export function PeriodPicker({
  month,
  year,
  walletId,
}: {
  month: number;
  year: number;
  walletId?: string;
}) {
  const router = useRouter();

  const go = (m: number, y: number) => {
    const params = new URLSearchParams();
    params.set('month', String(m));
    params.set('year', String(y));
    if (walletId) params.set('walletId', walletId);
    router.replace(`/laporan?${params.toString()}`);
  };

  const shift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    go(d.getMonth() + 1, d.getFullYear());
  };

  // 18 bulan terakhir: cukup untuk membandingkan tahun berjalan tanpa
  // membuat daftar menjadi gulungan panjang.
  const options = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    };
  });

  const current = `${year}-${String(month).padStart(2, '0')}`;
  // Bulan yang dipilih lewat URL bisa lebih lama dari daftar; tambahkan agar label benar.
  if (!options.some((o) => o.value === current)) {
    options.push({
      value: current,
      label: new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      }),
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => shift(-1)}
        aria-label="Bulan sebelumnya"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="w-[178px]">
        <Select
          value={current}
          onValueChange={(v) => {
            const [y, m] = v.split('-').map(Number);
            go(m, y);
          }}
          options={options}
          size="sm"
          aria-label="Pilih periode"
        />
      </div>
      <button
        type="button"
        onClick={() => shift(1)}
        aria-label="Bulan berikutnya"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
