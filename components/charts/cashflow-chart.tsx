'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatIDR } from '@/lib/format';

interface Point {
  date: string;
  masuk: number;
  keluar: number;
}

function compactIDR(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.0', '')}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`;
  return String(n);
}

export function CashflowChart({ data }: { data: Point[] }) {
  const compact = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <ResponsiveContainer width="100%" height={252}>
      <AreaChart data={compact} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="cf-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.26} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cf-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 10.5, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.slice(5).replace('-', '/')}
          minTickGap={20}
        />
        <YAxis
          tick={{ fontSize: 10.5, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={compactIDR}
          width={44}
        />
        <Tooltip
          cursor={{ stroke: 'var(--brand-300)', strokeWidth: 1, strokeDasharray: '4 4' }}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: 12,
            padding: '8px 12px',
            background: 'var(--card)',
          }}
          labelStyle={{ fontWeight: 700, marginBottom: 4, color: 'var(--foreground)' }}
          formatter={(value, name) => [
            formatIDR(Number(value ?? 0)),
            name === 'masuk' ? 'Masuk' : 'Keluar',
          ]}
          labelFormatter={(l) =>
            new Date(String(l)).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }
        />

        <Area
          type="monotone"
          dataKey="masuk"
          stroke="var(--chart-1)"
          strokeWidth={2.2}
          fill="url(#cf-in)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
        />
        <Area
          type="monotone"
          dataKey="keluar"
          stroke="var(--chart-4)"
          strokeWidth={2}
          fill="url(#cf-out)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
