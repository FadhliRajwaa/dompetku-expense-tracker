'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { GoogleSignInButton } from '@/components/google-signin-button';
import {
  Field,
  FormError,
  PasswordInput,
  TextInput,
  useFieldState,
} from '@/components/auth/field';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState(
    params.get('error') ? 'Email atau kata sandi salah. Coba lagi.' : '',
  );
  const [loading, setLoading] = useState(false);
  const { touched, touch, touchAll } = useFieldState();

  const emailError =
    !email.trim() ? 'Email wajib diisi.' : !EMAIL_RE.test(email.trim()) ? 'Format email belum benar.' : '';
  const pwError = !password ? 'Kata sandi wajib diisi.' : password.length < 8 ? 'Minimal 8 karakter.' : '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    touchAll(['email', 'password']);
    if (emailError || pwError) return;
    setLoading(true);
    try {
      await signIn('credentials', { email: email.trim(), password, redirectTo: '/dashboard' });
    } catch {
      setServerError('Terjadi kesalahan jaringan. Periksa koneksimu lalu coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-display text-[2.05rem] leading-tight">Selamat datang kembali</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Masuk untuk melanjutkan pencatatan keuanganmu.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
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

        <Field label="Kata sandi" htmlFor="password" error={touched.password ? pwError : undefined}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setServerError('');
            }}
            onBlur={() => touch('password')}
            placeholder="••••••••"
            invalid={touched.password && Boolean(pwError)}
          />
        </Field>

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
              Memeriksa…
            </>
          ) : (
            <>
              Masuk
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

        <GoogleSignInButton mode="login" />
      </form>

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        Belum punya akun?{' '}
        <Link href="/register" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
          Daftar gratis
        </Link>
      </p>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
        <span className="material-symbols-outlined text-[14px] text-brand-500">lock</span>
        Kata sandi di-hash · Sesi httpOnly · Data terpisah per akun
      </p>
    </div>
  );
}
