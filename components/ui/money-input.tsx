'use client';

import { cn } from 'cn';

/**
 * Input nominal Rupiah.
 *
 * Menyimpan angka mentah di state pemanggil, tetapi menampilkan titik ribuan
 * supaya "1250000" tidak terbaca sebagai deretan angka tanpa arti. Kursor
 * tidak melompat karena nilai selalu diformat ulang dari digit saja.
 */
export function MoneyInput({
  value,
  onChange,
  id,
  placeholder = '0',
  invalid,
  size = 'md',
  className,
  currency = 'Rp',
  autoFocus,
}: {
  value: string;
  onChange: (digits: string) => void;
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  size?: 'md' | 'lg';
  className?: string;
  currency?: string;
  autoFocus?: boolean;
}) {
  const display = value ? Number(value).toLocaleString('id-ID') : '';
  return (
    <div className={cn('relative', className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted-foreground">
        {currency}
      </span>
      <input
        id={id}
        autoFocus={autoFocus}
        inputMode="numeric"
        value={display}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 15))}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={cn(
          'numeral w-full rounded-xl border bg-card pl-11 pr-3.5 text-right outline-none transition-all placeholder:text-muted-foreground/40 focus:ring-4',
          size === 'lg' ? 'h-14 text-[1.4rem]' : 'h-11 text-[14.5px]',
          invalid
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'
            : 'border-input focus:border-brand-400 focus:ring-brand-500/12',
        )}
      />
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
      {children}
      {optional && <span className="ml-1 font-normal text-muted-foreground">(opsional)</span>}
    </label>
  );
}

export function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[11.5px] font-medium text-rose-600 dark:text-rose-400">
      {message}
    </p>
  );
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  invalid,
  autoFocus,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <input
      id={id}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-xl border bg-card px-3.5 text-[13.5px] outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-4',
        invalid
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'
          : 'border-input focus:border-brand-400 focus:ring-brand-500/12',
      )}
    />
  );
}
