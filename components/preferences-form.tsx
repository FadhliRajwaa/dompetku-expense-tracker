'use client';

import { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Select } from '@/components/ui/select-premium';
import { CURRENCY_META, SUPPORTED_CURRENCIES } from '@/lib/currency';

const THEMES = [
  { value: 'system', label: 'Ikuti sistem', icon: 'brightness_auto' },
  { value: 'light', label: 'Terang', icon: 'light_mode' },
  { value: 'dark', label: 'Gelap', icon: 'dark_mode' },
] as const;

export function PreferencesForm({ initialCurrency }: { initialCurrency: string }) {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(initialCurrency);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveCurrency(next: string) {
    setCurrency(next);
    setMsg('');
    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setMsg(j.error ?? 'Gagal menyimpan');
        return;
      }
      setMsg('Mata uang disimpan');
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setMsg('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[12px] font-semibold text-foreground">Tampilan</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema tampilan">
          {THEMES.map((t) => {
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[11.5px] font-semibold transition-all ${
                  active
                    ? 'border-brand-400 bg-brand-50 text-brand-800 ring-2 ring-brand-500/15'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="currency" className="text-[12px] font-semibold text-foreground">
          Mata uang utama
        </label>
        <p className="text-[11.5px] text-muted-foreground">
          Dipakai sebagai acuan konversi saat melihat total lintas mata uang.
        </p>
        <div className="mt-2">
          <Select
            id="currency"
            value={currency}
            onValueChange={saveCurrency}
            disabled={saving}
            options={SUPPORTED_CURRENCIES.map((c) => ({
              value: c,
              label: c,
              hint: CURRENCY_META[c].label,
            }))}
            aria-label="Mata uang utama"
          />
        </div>
      </div>

      {msg && <p className="text-[12px] font-medium text-brand-700">{msg}</p>}

      <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Preferensi tema disimpan di perangkat ini dan disinkronkan ke akunmu saat memilih mata uang.
      </p>
    </div>
  );
}
