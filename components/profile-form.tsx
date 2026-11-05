'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [n, setN] = useState(name);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setMsg('');
    if (n.trim().length < 2) {
      setMsg('Nama minimal 2 karakter');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n.trim() }),
      });
      const json = await res.json();
      setMsg(res.ok ? 'Profil tersimpan' : (json.error ?? 'Gagal menyimpan'));
    } catch {
      setMsg('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      <div>
        <Label htmlFor="p-name">Nama</Label>
        <Input id="p-name" value={n} onChange={(e) => setN(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={email} disabled className="mt-1 opacity-60" />
      </div>
      {msg && <p className="text-sm text-foreground/80">{msg}</p>}
      <Button onClick={save} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white w-fit">
        {saving ? 'Menyimpan...' : 'Simpan Profil'}
      </Button>
    </div>
  );
}
