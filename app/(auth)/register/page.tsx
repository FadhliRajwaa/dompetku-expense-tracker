'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ArrowRight, Check } from 'lucide-react';
import { GoogleSignInButton } from '@/components/google-signin-button';
import {
  Field,
  FormError,
  PasswordInput,
  PasswordStrength,
  TextInput,
  useFieldState,
} from '@/components/auth/field';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { touched, touch, touchAll } = useFieldState();

  const nameError =
    !name.trim() ? 'Nama wajib diisi.' : name.trim().length < 2 ? 'Minimal 2 karakter.' : '';
  const emailError =
    !email.trim() ? 'Email wajib diisi.' : !EMAIL_RE.test(email.trim()) ? 'Format email belum benar.' : '';
  const pwError =
    !password ? 'Kata sandi wajib diisi.' : password.length < 8 ? 'Minimal 8 karakter.' : '';
  const agreeError = !agree ? 'Centang dulu untuk melanjutkan.' : '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    touchAll(['name', 'email', 'password', 'agree']);
    if (nameError || emailError || pwError || agreeError) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setServerError(json.error ?? 'Pendaftaran gagal. Coba lagi sebentar.');
        setLoading(false);
        return;
      }
      await signIn('credentials', {
        email: email.trim(),
        password,
        redirectTo: '/dashboard',
      });
    } catch {
      setServerError('Terjadi kesalahan jaringan. Periksa koneksimu lalu coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-display text-[2.05rem] leading-tight">Buat akun DompetKu</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Gratis, tanpa kartu kredit. Selesai dalam satu menit.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
        <Field label="Nama" htmlFor="name" error={touched.name ? nameError : undefined}>
          <TextInput
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setServerError('');
            }}
            onBlur={() => touch('name')}
            placeholder="Nama kamu"
            autoComplete="name"
            invalid={touched.name && Boolean(nameError)}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={touched.email ? emailError : undefined}>
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setServerError('');
            }}
            onBlur={() => touch('email')}
            placeholder="nama@email.com"
            invalid={touched.email && Boolean(emailError)}
          />
        </Field>

        <Field
          label="Kata sandi"
          htmlFor="password"
          error={touched.password ? pwError : undefined}
          hint={password && !pwError ? undefined : 'Minimal 8 karakter'}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setServerError('');
            }}
            onBlur={() => touch('password')}
            placeholder="Minimal 8 karakter"
            invalid={touched.password && Boolean(pwError)}
          />
          <PasswordStrength value={password} />
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                setServerError('');
              }}
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-brand-500"
            />
            <span className="text-[12.5px] leading-relaxed text-muted-foreground">
              Saya setuju data saya hanya dipakai untuk menjalankan aplikasi ini — tanpa iklan dan
              tanpa penjualan data.
            </span>
          </label>
          {touched.agree && agreeError && (
            <p role="alert" className="mt-1.5 text-[11.5px] font-medium text-rose-600 dark:text-rose-400">
              {agreeError}
            </p>
          )}
        </div>

        <FormError message={serverError} />

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14.5px] font-bold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Membuat akun…
            </>
          ) : (
            <>
              Daftar gratis
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground/70">
            atau
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton mode="register" />
      </form>

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground/80">
        {['Gratis selamanya', 'Ekspor kapan saja', 'Tanpa iklan'].map((t) => (
          <li key={t} className="flex items-center gap-1">
            <Check className="size-3 text-brand-500" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
