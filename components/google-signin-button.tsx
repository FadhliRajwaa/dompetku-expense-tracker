'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function GoogleSignInButton({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn('google', { redirectTo: '/dashboard' });
      }}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-input bg-card text-[14.5px] font-semibold text-foreground shadow-xs transition-all hover:bg-muted hover:shadow-sm active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
    >
      <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c0 1.1-.8 2.7-2.4 3.7l-.1.3 3.4 2.6.2.1c2.2-2 3.9-5 3.9-8.7z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.3.1-3.5 2.7v.2C3.4 21.4 7.4 24 12 24z" />
        <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.3-3.4-2.7-.1.1C.6 8.6 0 10.2 0 12s.6 3.4 1.6 4.9l3.6-2.5z" />
        <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.6 1.6 6.6l3.6 2.9c1-2.9 3.7-4.8 6.8-4.8z" />
      </svg>
      {loading ? 'Menghubungkan…' : mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
    </button>
  );
}
