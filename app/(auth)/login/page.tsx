'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { GoogleSignInButton } from '@/components/google-signin-button';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const fieldClass =
  'h-12 w-full rounded-xl border border-input bg-card px-3.5 text-[14.5px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12';

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    params.get('error') ? 'Email atau password salah. Coba lagi.' : '',
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    } catch {
      setError('Terjadi kesalahan jaringan. Periksa koneksimu.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-display text-[2.1rem] leading-tight text-foreground">Selamat datang kembali</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Masuk untuk melanjutkan pencatatan keuanganmu.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-semibold text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={fieldClass}
          />
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5">
            <span className="material-symbols-outlined mt-px shrink-0 text-[17px] text-rose-600">error</span>
            <p className="text-[13px] leading-snug text-rose-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-12 w-full rounded-xl bg-brand-500 text-[14.5px] font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? 'Memeriksa…' : 'Masuk'}
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
        Kata sandi di-hash · Session httpOnly · Data terpisah per akun
      </p>
    </div>
  );
}
