'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

/**
 * Bila pengguna sudah mengisi tapi nilainya belum sah, jangan langsung
 * menyala merah saat mengetik — itu menghukum orang yang baru mulai.
 * Validasi baru muncul setelah field ditinggalkan (blur) atau saat submit.
 */
export function useFieldState() {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  return {
    touched,
    touch: (k: string) => setTouched((t) => (t[k] ? t : { ...t, [k]: true })),
    touchAll: (keys: string[]) =>
      setTouched(Object.fromEntries(keys.map((k) => [k, true]))),
  };
}

export function Field({
  label,
  error,
  hint,
  valid,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  valid?: boolean;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[11.5px] font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
          {valid && <Check className="size-3.5 text-brand-500" aria-hidden="true" />}
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const baseInput =
  'h-12 w-full rounded-xl border bg-card px-3.5 text-[14.5px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-4';

export function TextInput({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cn(
        baseInput,
        invalid
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'
          : 'border-input focus:border-brand-400 focus:ring-brand-500/12',
        className,
      )}
    />
  );
}

/** Input kata sandi dengan tombol lihat/sembunyikan. */
export function PasswordInput({
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
        className={cn(
          baseInput,
          'pr-11',
          invalid
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'
            : 'border-input focus:border-brand-400 focus:ring-brand-500/12',
        )}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** Indikator kekuatan kata sandi — tiga tingkat, bukan skor palsu 0–100. */
export function PasswordStrength({ value }: { value: string }) {
  const score = (() => {
    if (!value) return 0;
    let s = 0;
    if (value.length >= 8) s++;
    if (value.length >= 12) s++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  })();

  const level = score <= 1 ? 0 : score <= 3 ? 1 : 2;
  const meta = [
    { label: 'Lemah', bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', w: '33%' },
    { label: 'Cukup', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', w: '66%' },
    { label: 'Kuat', bar: 'bg-brand-500', text: 'text-brand-600 dark:text-brand-400', w: '100%' },
  ][level];

  if (!value) return null;

  return (
    <div className="mt-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-300', meta.bar)}
          style={{ width: meta.w }}
        />
      </div>
      <p className={cn('mt-1 text-[11px] font-semibold', meta.text)}>
        Kekuatan kata sandi: {meta.label}
      </p>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 dark:border-rose-500/25 dark:bg-rose-950/40"
    >
      <AlertCircle
        className="mt-px size-4 shrink-0 text-rose-600 dark:text-rose-400"
        aria-hidden="true"
      />
      <p className="text-[13px] leading-snug text-rose-700 dark:text-rose-200">{message}</p>
    </div>
  );
}

export { baseInput };
