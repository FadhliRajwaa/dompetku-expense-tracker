'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatIDR } from '@/lib/format';

interface Point {
  date: string;
  masuk: number;
  keluar: number;
}

export function CashflowChart({ data }: { data: Point[] }) {
  const compact = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={compact} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} minTickGap={24} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => (v >= 1_000_000 ? `${v / 1_000_000}jt` : `${v / 1000}rb`)} width={48} />
        <Tooltip
          formatter={(value, name) => [formatIDR(Number(value ?? 0)), name === 'masuk' ? 'Pemasukan' : 'Pengeluaran']}
          labelFormatter={(l) => `Tanggal ${l}`}
        />
        <Area type="monotone" dataKey="masuk" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
        <Area type="monotone" dataKey="keluar" stroke="#f43f5e" fill="#f43f5e22" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
