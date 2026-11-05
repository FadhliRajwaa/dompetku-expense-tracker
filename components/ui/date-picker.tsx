'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** ISO `YYYY-MM-DD` dari Date lokal — TIDAK lewat toISOString() agar tidak geser zona waktu. */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Minggu dimulai Senin; index 0 = Senin. */
function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

interface DatePickerProps {
  /** Nilai ISO `YYYY-MM-DD`. String kosong = belum dipilih. */
  value: string;
  onChange: (iso: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  'aria-label'?: string;
}

const SIZES = {
  sm: 'h-9 text-[12.5px] pl-8.5 pr-3',
  md: 'h-11 text-[13.5px] pl-10 pr-3.5',
  lg: 'h-12 text-[14.5px] pl-10 pr-4',
} as const;

/**
 * Date picker premium.
 *
 * Kalender dibuat manual (bukan `<input type="date">`) karena kontrol native
 * tidak bisa ditata dan di beberapa browser menampilkan spinner tahun ala OS.
 * Di sini popup juga `modal` agar di HP tidak tertutup keyboard virtual,
 * dan tombol pintasan "Hari ini / Kemarin" mempercepat input transaksi.
 */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = 'Pilih tanggal',
  className,
  size = 'md',
  clearable,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);
  const today = React.useMemo(() => new Date(), []);
  // Bulan yang sedang ditampilkan di kalender (bisa berbeda dari yang terpilih).
  const [view, setView] = React.useState<Date>(() => startOfMonth(selected ?? today));

  React.useEffect(() => {
    if (open) setView(startOfMonth(selected ?? new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const label = selected
    ? selected.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // Matriks 6 minggu: sel tanggal lengkap termasuk hari dari bulan tetangga.
  const cells = React.useMemo(() => {
    const first = startOfMonth(view);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayIndex(first));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [view]);

  const shiftMonth = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const pick = (d: Date) => {
    onChange(toISODate(d));
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        id={id}
        aria-label={aria['aria-label'] ?? 'Pilih tanggal'}
        className={cn(
          'group relative flex w-full items-center rounded-xl border border-input bg-card text-left font-medium text-foreground shadow-xs outline-none transition-all',
          'hover:border-brand-300 focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-500/12',
          'data-[popup-open]:border-brand-400 data-[popup-open]:ring-4 data-[popup-open]:ring-brand-500/12',
          SIZES[size],
          className,
        )}
      >
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
        />
        <span className={cn('truncate', !label && 'text-muted-foreground/70')}>
          {label || placeholder}
        </span>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className="isolate z-50 max-w-[calc(100vw-1rem)]"
        >
          <PopoverPrimitive.Popup
            // Lenis mencegat wheel di seluruh dokumen; tanpa atribut ini popup
            // yang lebih tinggi dari layar tidak bisa digulir di desktop.
            data-lenis-prevent
            className={cn(
              'w-[19.5rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/70 bg-popover p-3 text-popover-foreground shadow-lg outline-none',
              'origin-(--transform-origin)',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
              'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            )}
          >
            {/* Kepala: navigasi bulan */}
            <div className="flex items-center justify-between gap-1 px-0.5">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Bulan sebelumnya"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <p aria-live="polite" className="text-[13.5px] font-bold">
                {BULAN[view.getMonth()]} {view.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Bulan berikutnya"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Nama hari */}
            <div className="mt-2 grid grid-cols-7 gap-0.5" aria-hidden="true">
              {HARI.map((h) => (
                <span
                  key={h}
                  className="py-1 text-center text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground/70"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-7 gap-0.5" role="group" aria-label="Kalender">
              {cells.map((d, i) => {
                const outside = d.getMonth() !== view.getMonth();
                const isToday = sameDay(d, today);
                const isSel = selected ? sameDay(d, selected) : false;
                const full = d.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(d)}
                    aria-label={full}
                    aria-current={isToday ? 'date' : undefined}
                    aria-pressed={isSel}
                    className={cn(
                      'relative flex h-9 items-center justify-center rounded-lg text-[12.5px] font-medium tabular transition-colors',
                      outside && 'text-muted-foreground/35',
                      !outside && !isSel && 'text-foreground hover:bg-muted',
                      isSel && 'bg-brand-500 font-bold text-white shadow-sm hover:bg-brand-600',
                      !isSel && isToday && 'ring-1 ring-inset ring-brand-400/70',
                      // Hari ini tapi juga terpilih: tetap putih di atas hijau
                      isSel && isToday && 'ring-white/60',
                    )}
                  >
                    {d.getDate()}
                    {isToday && !isSel && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pintasan */}
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-border/60 pt-2.5">
              {[
                { label: 'Hari ini', get: () => new Date() },
                {
                  label: 'Kemarin',
                  get: () => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    return d;
                  },
                },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => pick(q.get())}
                  className="h-7 flex-1 rounded-lg bg-muted text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {q.label}
                </button>
              ))}
              {clearable && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className="h-7 rounded-lg px-2.5 text-[11.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  Hapus
                </button>
              )}
            </div>

            <p className="mt-2 text-center text-[10.5px] text-muted-foreground/70">
              Tanggal mengikuti zona waktu perangkatmu
            </p>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
