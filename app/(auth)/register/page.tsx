'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { GoogleSignInButton } from '@/components/google-signin-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        setError(json.error ?? 'Pendaftaran gagal');
        return;
      }
      await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafcfb] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Buat akun DompetKu</CardTitle>
          <CardDescription>Mulai catat keuanganmu dalam 3 menit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" required minLength={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password (min. 8 karakter)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="bg-[#2FA084] hover:bg-[#27856d] text-white w-full">
              {loading ? 'Mendaftar...' : 'Daftar'}
            </Button>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" /> atau <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <GoogleSignInButton mode="register" />
            <p className="text-center text-sm text-zinc-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-[#2FA084] hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
