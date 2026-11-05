'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Daftarkan service worker + tangkap prompt "Install aplikasi".
 * Prompt hanya muncul bila browser mendukung dan pengguna belum menolak.
 */
export function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Daftarkan setelah load agar tidak berebut bandwidth dengan render awal.
      const onLoad = () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          /* offline shell opsional — abaikan kegagalan */
        });
      };
      if (document.readyState === 'complete') onLoad();
      else window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem('dompetku-install-dismissed') === '1') return;
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || hidden) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-card p-3.5 shadow-[var(--shadow-lg)] lg:bottom-6">
      <div className="flex items-start gap-3">
        <img src="/logo.svg" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight">Pasang DompetKu</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            Akses lebih cepat dari layar utama, tanpa membuka browser.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem('dompetku-install-dismissed', '1');
            setHidden(true);
          }}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted"
          aria-label="Tutup"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={async () => {
            await deferred.prompt();
            const choice = await deferred.userChoice;
            if (choice.outcome === 'dismissed') {
              localStorage.setItem('dompetku-install-dismissed', '1');
            }
            setDeferred(null);
            setHidden(true);
          }}
          className="h-9 flex-1 rounded-lg bg-brand-500 text-[12.5px] font-bold text-white hover:bg-brand-600"
        >
          Pasang
        </button>
        <button
          onClick={() => {
            localStorage.setItem('dompetku-install-dismissed', '1');
            setHidden(true);
          }}
          className="h-9 rounded-lg border border-border px-3 text-[12.5px] font-medium hover:bg-muted"
        >
          Nanti
        </button>
      </div>
    </div>
  );
}
