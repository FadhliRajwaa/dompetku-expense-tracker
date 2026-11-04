'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatIDR } from '@/lib/format';

interface Slice {
  id: string;
  name: string;
  color: string;
  total: number;
  percent: number;
}

export function CategoryDonut({ data }: { data: Slice[] }) {
  if (!data.length) return <p className="py-8 text-center text-sm text-zinc-500">Belum ada pengeluaran bulan ini</p>;
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((s) => (
              <Cell key={s.id} fill={s.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatIDR(Number(value ?? 0))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1.5">
        {data.slice(0, 6).map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.name}</span>
            <span className="font-medium">{formatIDR(s.total)}</span>
            <span className="w-12 text-right text-zinc-500">{s.percent.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
