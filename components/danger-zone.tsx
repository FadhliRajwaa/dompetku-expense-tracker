'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DangerZone({ email }: { email: string }) {
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function destroy() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        setError('Gagal menghapus akun');
        return;
      }
      await signOut({ redirectTo: '/' });
    } catch {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      <p className="text-sm text-foreground/80">
        Menghapus akun akan menghapus seluruh dompet, transaksi, budget, dan kategori kamu secara permanen. Tindakan ini tidak bisa dibatalkan.
      </p>
      <div>
        <Label htmlFor="dz-email">Ketik email kamu untuk konfirmasi: {email}</Label>
        <Input id="dz-email" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={email} className="mt-1" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        variant="destructive"
        disabled={loading || confirm.trim().toLowerCase() !== email.toLowerCase()}
        onClick={destroy}
        className="w-fit"
      >
        {loading ? 'Menghapus...' : 'Hapus Akun Saya'}
      </Button>
    </div>
  );
}
