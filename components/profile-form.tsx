'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, FieldLabel, TextField } from '@/components/ui/money-input';

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [n, setN] = useState(name);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setMsg('');
    setErr('');
    if (n.trim().length < 2) {
      setErr('Nama minimal 2 karakter.');
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
      if (res.ok) setMsg('Profil tersimpan.');
      else setErr(json.error ?? 'Gagal menyimpan.');
    } catch {
      setErr('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="p-name">Nama</FieldLabel>
        <TextField
          id="p-name"
          value={n}
          onChange={(v) => {
            setN(v);
            setErr('');
            setMsg('');
          }}
          maxLength={80}
          invalid={Boolean(err)}
        />
        <FieldError message={err} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="p-email">Email</FieldLabel>
        <input
          id="p-email"
          value={email}
          disabled
          className="h-11 w-full cursor-not-allowed rounded-xl border border-input bg-muted px-3.5 text-[13.5px] text-muted-foreground"
        />
        <p className="text-[11.5px] text-muted-foreground">
          Email dipakai untuk login dan tidak bisa diubah di sini.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={save}
          disabled={saving || n.trim() === name}
          className="h-10 gap-1.5 rounded-xl bg-brand-500 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-600"
        >
          {saving ? 'Menyimpan…' : 'Simpan profil'}
        </Button>
        {msg && (
          <p className="flex items-center gap-1 text-[12px] font-medium text-brand-700 dark:text-brand-400">
            <Check className="size-3.5" aria-hidden="true" />
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
