'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { GoogleSignInButton } from '@/components/google-signin-button';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(params.get('error') ? 'Email atau password salah' : '');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafcfb] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Masuk ke DompetKu</CardTitle>
          <CardDescription>Lanjutkan pencatatan keuanganmu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="bg-[#2FA084] hover:bg-[#27856d] text-white w-full">
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" /> atau <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <GoogleSignInButton mode="login" />
            <p className="text-center text-sm text-zinc-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-[#2FA084] hover:underline">
                Daftar gratis
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
