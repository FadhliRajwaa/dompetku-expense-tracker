'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'dompetku-theme';

/**
 * Terapkan tema ke <html>. Preferensi disimpan di localStorage agar langsung
 * berlaku tanpa menunggu sesi, dan disinkronkan ke DB lewat halaman Pengaturan
 * supaya konsisten antar-perangkat saat login.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
}

export function ThemeProvider({ initial }: { initial: Theme }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? initial ?? 'system';
    applyTheme(stored);
    setReady(true);

    if (stored !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [initial]);

  void ready;
  return null;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    setThemeState((localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system');
  }, []);

  function setTheme(next: Theme) {
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setThemeState(next);
    // Simpan ke profil agar preferensi mengikuti akun di perangkat lain.
    fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  return { theme, setTheme };
}
