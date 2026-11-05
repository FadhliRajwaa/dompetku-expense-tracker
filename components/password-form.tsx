'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordForm() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setMsg('');
    if (newPw.length < 8) {
      setMsg('Password baru minimal 8 karakter');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      const json = await res.json();
      setMsg(res.ok ? 'Password berhasil diubah' : (json.error ?? 'Gagal mengubah password'));
      if (res.ok) {
        setOldPw('');
        setNewPw('');
      }
    } catch {
      setMsg('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      <div>
        <Label htmlFor="pw-old">Password lama</Label>
        <Input id="pw-old" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="pw-new">Password baru (min. 8 karakter)</Label>
        <Input id="pw-new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1" />
      </div>
      {msg && <p className="text-sm text-foreground/80">{msg}</p>}
      <Button onClick={save} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white w-fit">
        {saving ? 'Menyimpan...' : 'Ubah Password'}
      </Button>
    </div>
  );
}
