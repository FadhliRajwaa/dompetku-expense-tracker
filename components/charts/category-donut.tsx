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
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <span className="material-symbols-outlined text-[22px]">donut_large</span>
        </span>
        <p className="mt-3 text-[13px] font-medium text-muted-foreground">Belum ada pengeluaran</p>
        <p className="text-[12px] text-muted-foreground/70">Catat transaksi untuk melihat komposisinya.</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={186}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2.5}
              strokeWidth={0}
            >
              {data.map((s) => (
                <Cell key={s.id} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                fontSize: 12,
                background: 'var(--card)',
              }}
              formatter={(value, name) => [formatIDR(Number(value ?? 0)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Angka total di tengah donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Total</p>
          <p className="numeral text-[15px] leading-tight text-foreground">{formatIDR(total)}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {data.slice(0, 5).map((s) => (
          <li key={s.id} className="flex items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground/85">
              {s.name}
            </span>
            <span className="shrink-0 text-[12px] tabular font-semibold text-foreground/70">
              {formatIDR(s.total)}
            </span>
            <span className="w-10 shrink-0 text-right text-[11.5px] tabular text-muted-foreground">
              {s.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
