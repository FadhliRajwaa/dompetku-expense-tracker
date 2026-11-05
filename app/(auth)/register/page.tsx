'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { GoogleSignInButton } from '@/components/google-signin-button';

const fieldClass =
  'h-12 w-full rounded-xl border border-input bg-card px-3.5 text-[14.5px] text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Pendaftaran gagal. Coba lagi.');
        setLoading(false);
        return;
      }
      await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    } catch {
      setError('Terjadi kesalahan jaringan. Periksa koneksimu.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-display text-[2.1rem] leading-tight text-foreground">Buat akun DompetKu</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Gratis, tanpa kartu kredit. Selesai dalam satu menit.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[13px] font-semibold text-foreground">
            Nama
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            required
            minLength={2}
            autoComplete="name"
            className={fieldClass}
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            required
            minLength={8}
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
          {loading ? 'Membuat akun…' : 'Daftar gratis'}
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

      <p className="mt-6 text-center text-[11.5px] leading-relaxed text-muted-foreground/70">
        Dengan mendaftar kamu setuju datamu hanya dipakai untuk menjalankan aplikasi ini.
      </p>
    </div>
  );
}
