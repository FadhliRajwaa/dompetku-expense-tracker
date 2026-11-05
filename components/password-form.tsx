'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, FieldLabel, TextField } from '@/components/ui/money-input';
import { PasswordStrength } from '@/components/auth/field';

export function PasswordForm() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setErr('');
    setMsg('');
    if (newPw.length < 8) {
      setErr('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPw === oldPw) {
      setErr('Kata sandi baru harus berbeda dari yang lama.');
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
      if (res.ok) {
        setMsg('Kata sandi berhasil diubah.');
        setOldPw('');
        setNewPw('');
      } else {
        setErr(json.error ?? 'Gagal mengubah kata sandi.');
      }
    } catch {
      setErr('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="pw-old">Kata sandi lama</FieldLabel>
        <TextField
          id="pw-old"
          value={oldPw}
          onChange={(v) => {
            setOldPw(v);
            setErr('');
          }}
          placeholder="Masukkan kata sandi saat ini"
          invalid={Boolean(err)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="pw-new">Kata sandi baru</FieldLabel>
        <TextField
          id="pw-new"
          value={newPw}
          onChange={(v) => {
            setNewPw(v);
            setErr('');
          }}
          placeholder="Minimal 8 karakter"
          invalid={Boolean(err)}
        />
        <PasswordStrength value={newPw} />
      </div>

      <FieldError message={err} />

      <div className="flex items-center gap-2">
        <Button
          onClick={save}
          disabled={saving || !oldPw || !newPw}
          className="h-10 gap-1.5 rounded-xl bg-brand-500 px-4 text-[12.5px] font-semibold text-white hover:bg-brand-600"
        >
          {saving ? 'Menyimpan…' : 'Ubah kata sandi'}
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
