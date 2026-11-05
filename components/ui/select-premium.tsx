'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Baris kedua opsional — dipakai untuk nama dompet + saldo, dsb. */
  hint?: string;
  /** Ikon material-symbols; diabaikan bila tidak ada. */
  icon?: string;
  /** Titik warna kecil di kiri. */
  color?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  /** Tinggi kontrol. `lg` dipakai di form utama, `sm` di filter. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label'?: string;
}

const SIZES = {
  sm: 'h-9 text-[12.5px] px-3',
  md: 'h-11 text-[13.5px] px-3.5',
  lg: 'h-12 text-[14.5px] px-4',
} as const;

/**
 * Select premium.
 *
 * Dibangun di atas Base UI Popover, bukan `<select>` native, supaya:
 *  - highlight aktif dan item terpilih punya state visual sendiri;
 *  - bisa menampilkan hint dua baris dan titik warna;
 *  - posisi popup dibalik otomatis bila ruang bawah habis;
 *  - tetap dapat dioperasikan penuh lewat keyboard (sesuai ARIA listbox).
 *
 * Di layar sentuh popup dipaksa lebar penuh trigger agar target ketuk besar.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Pilih…',
  id,
  className,
  size = 'md',
  disabled,
  ...aria
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // Indeks awal mengikuti nilai terpilih setiap popup dibuka.
  React.useEffect(() => {
    if (!open) return;
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : 0);
  }, [open, options, value]);

  // Pastikan item aktif selalu terlihat saat navigasi keyboard.
  React.useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const commit = (idx: number) => {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    onValueChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(active);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        id={id}
        disabled={disabled}
        aria-label={aria['aria-label']}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'group flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-card text-left font-medium text-foreground shadow-xs outline-none transition-all',
          'hover:border-brand-300 focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-500/12',
          'data-[popup-open]:border-brand-400 data-[popup-open]:ring-4 data-[popup-open]:ring-brand-500/12',
          'disabled:cursor-not-allowed disabled:opacity-55',
          SIZES[size],
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.color && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: selected.color }}
              aria-hidden="true"
            />
          )}
          {selected?.icon && (
            <span className="material-symbols-outlined shrink-0 text-[17px] text-muted-foreground">
              {selected.icon}
            </span>
          )}
          <span className={cn('truncate', !selected && 'text-muted-foreground/70')}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-brand-500',
          )}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          // `min-w-(--anchor-width)` + `w-max`: popup melebar mengikuti label
          // terpanjang, tidak pernah lebih sempit dari trigger. Versi
          // sebelumnya memakai lebar tetap = anchor width, sehingga label
          // seperti "Pengeluaran" terpotong di trigger yang sempit.
          className="isolate z-50 w-max min-w-(--anchor-width) max-w-[min(22rem,calc(100vw-1.5rem))]"
        >
          <PopoverPrimitive.Popup
            ref={listRef}
            role="listbox"
            aria-label={aria['aria-label']}
            onKeyDown={onKeyDown}
            className={cn(
              // 16rem dipilih agar popup tetap muat di bawah trigger pada sheet
              // setinggi ~92dvh. Dengan 20rem, Base UI membalik popup ke atas
              // dan menutupi field nominal.
              'max-h-[min(16rem,var(--available-height))] overflow-y-auto overscroll-contain rounded-2xl border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-lg',
              'origin-(--transform-origin) outline-none',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
              'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            )}
          >
            {options.length === 0 && (
              <p className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">
                Tidak ada pilihan
              </p>
            )}
            {options.map((o, i) => {
              const isSel = o.value === value;
              const isActive = i === active;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  data-idx={i}
                  disabled={o.disabled}
                  // MouseEnter (bukan pointermove) agar tidak membanjiri state saat scroll.
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                    'disabled:pointer-events-none disabled:opacity-40',
                    isActive && !isSel && 'bg-muted',
                    isSel && 'bg-brand-50 dark:bg-brand-900/40',
                  )}
                  // Label sekarang boleh sepanjang teksnya; popup yang melebar,
                  // bukan teks yang dipotong.
                >
                  {o.color && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: o.color }}
                      aria-hidden="true"
                    />
                  )}
                  {o.icon && (
                    <span
                      className={cn(
                        'material-symbols-outlined shrink-0 text-[18px]',
                        isSel ? 'text-brand-600' : 'text-muted-foreground',
                      )}
                    >
                      {o.icon}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block whitespace-nowrap text-[13.5px]',
                        isSel ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-medium',
                      )}
                    >
                      {o.label}
                    </span>
                    {o.hint && (
                      <span className="block whitespace-nowrap text-[11px] text-muted-foreground">
                        {o.hint}
                      </span>
                    )}
                  </span>
                  {isSel && <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />}
                </button>
              );
            })}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
