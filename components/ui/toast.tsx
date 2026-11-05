'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import { cn } from 'cn';
import {
  AlertTriangle,
  Check,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from 'lucide-react';

/* ============================================================================
   Manajer toast global
   ============================================================================

   Diletakkan di level modul supaya `toast.success()` bisa dipanggil dari mana
   saja — komponen client, handler form, bahkan kode yang bukan React (mis.
   util fetch). Provider di root hanya perlu diberikan manajer yang sama.
   ========================================================================== */

export type ToastKind = 'success' | 'error' | 'info' | 'warning' | 'loading';

export const toastManager = ToastPrimitive.createToastManager();

const TONE: Record<
  ToastKind,
  { icon: typeof Check; badge: string; ring: string; bar: string; label: string }
> = {
  success: {
    icon: Check,
    badge: 'bg-brand-500 text-white',
    ring: 'ring-brand-500/15',
    bar: 'bg-brand-500',
    label: 'Berhasil',
  },
  error: {
    icon: TriangleAlert,
    badge: 'bg-rose-500 text-white',
    ring: 'ring-rose-500/15',
    bar: 'bg-rose-500',
    label: 'Gagal',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-500 text-white',
    ring: 'ring-amber-500/15',
    bar: 'bg-amber-500',
    label: 'Perhatian',
  },
  info: {
    icon: Info,
    badge: 'bg-foreground text-background',
    ring: 'ring-foreground/10',
    bar: 'bg-foreground/70',
    label: 'Info',
  },
  loading: {
    icon: Loader2,
    badge: 'bg-muted text-muted-foreground',
    ring: 'ring-foreground/10',
    bar: 'bg-muted-foreground/40',
    label: 'Memproses',
  },
};

interface NotifyOptions {
  title: string;
  description?: React.ReactNode;
  /** Milidetik sebelum menutup sendiri. `0` = tetap sampai ditutup. */
  timeout?: number;
  /** Label tombol aksi opsional. */
  actionLabel?: string;
  onAction?: () => void;
  /** Id tetap: toast dengan id sama akan diperbarui di tempat. */
  id?: string;
}

function push(kind: ToastKind, opts: NotifyOptions) {
  const tone = TONE[kind];
  return toastManager.add({
    id: opts.id,
    type: kind,
    title: opts.title,
    description: opts.description,
    timeout: opts.timeout ?? (kind === 'error' ? 9000 : kind === 'loading' ? 0 : 4500),
    priority: kind === 'error' ? 'high' : 'low',
    actionProps:
      opts.actionLabel && opts.onAction
        ? { children: opts.actionLabel, onClick: opts.onAction }
        : undefined,
    data: { kind, icon: tone.icon },
  });
}

/**
 * API yang dipakai di seluruh aplikasi.
 *
 * `error()` menerima apa saja: string, Error, atau respons fetch. Pesan yang
 * ditampilkan selalu menjelaskan SEBABNYA, dan detail teknis tetap dicatat di
 * konsol supaya bisa ditelusuri tanpa membocorkannya ke layar pengguna.
 */
export const toast = {
  success(title: string, description?: React.ReactNode) {
    return push('success', { title, description });
  },
  info(title: string, description?: React.ReactNode) {
    return push('info', { title, description });
  },
  warning(title: string, description?: React.ReactNode) {
    return push('warning', { title, description });
  },
  error(
    title: string,
    cause?: unknown,
    opts?: { description?: string; context?: Record<string, unknown> },
  ) {
    const detail = describeError(cause);
    // Jejak lengkap untuk debugging; yang tampil hanya ringkasannya.
    console.error(`[DompetKu] ${title}`, { ...opts?.context, cause, detail });
    return push('error', {
      title,
      description: opts?.description ?? detail,
      timeout: 9000,
    });
  },
  loading(title: string, description?: React.ReactNode, id?: string) {
    return push('loading', { title, description, timeout: 0, id });
  },
  /** Ubah toast loading menjadi hasil akhir (sukses/gagal) memakai id yang sama. */
  resolve(id: string, kind: 'success' | 'error', title: string, description?: React.ReactNode) {
    return push(kind, { id, title, description });
  },
  dismiss(id?: string) {
    toastManager.close(id);
  },
};

/** Ringkas penyebab kegagalan menjadi satu kalimat yang bisa dibaca pengguna. */
export function describeError(cause: unknown): string {
  if (!cause) return '';
  if (typeof cause === 'string') return cause;
  if (cause instanceof Error) {
    if (cause.name === 'TypeError' && /fetch/i.test(cause.message)) {
      return 'Tidak bisa menghubungi server. Periksa koneksi internetmu.';
    }
    if (cause.name === 'AbortError') return 'Permintaan dibatalkan.';
    return cause.message || 'Terjadi kesalahan yang tidak diketahui.';
  }
  if (typeof cause === 'object' && cause !== null) {
    const anyErr = cause as { error?: unknown; message?: unknown; status?: unknown };
    if (typeof anyErr.error === 'string') return anyErr.error;
    if (typeof anyErr.message === 'string') return anyErr.message;
    if (typeof anyErr.status === 'number') {
      if (anyErr.status === 401) return 'Sesi habis. Silakan masuk kembali.';
      if (anyErr.status === 403) return 'Kamu tidak punya izin untuk tindakan ini.';
      if (anyErr.status === 404) return 'Data yang dimaksud tidak ditemukan.';
      if (anyErr.status === 429) return 'Terlalu banyak permintaan. Coba lagi sebentar lagi.';
      if (anyErr.status >= 500) return 'Server sedang bermasalah. Coba lagi beberapa saat lagi.';
    }
  }
  return 'Terjadi kesalahan. Coba lagi.';
}

/**
 * Bungkus satu panggilan fetch yang mengubah data:
 *  - mengembalikan `{ ok, data, error }` tanpa melempar;
 *  - menampilkan toast sukses/gagal secara otomatis;
 *  - mencatat penyebab teknis ke konsol.
 *
 * Semua aksi di aplikasi memakai ini supaya perilakunya seragam: tidak ada
 * kegagalan diam-diam, dan tidak ada sukses tanpa konfirmasi.
 */
export async function requestJson<T = unknown>(
  url: string,
  init: RequestInit & {
    successTitle?: string;
    successDescription?: string;
    errorTitle?: string;
    context?: Record<string, unknown>;
  },
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const { successTitle, successDescription, errorTitle, context, ...fetchInit } = init;
  try {
    const res = await fetch(url, fetchInit);
    const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };

    if (!res.ok) {
      const message = body.error ?? `Permintaan gagal (${res.status} ${res.statusText}).`;
      console.error(`[DompetKu] ${errorTitle ?? 'Aksi gagal'}`, {
        url,
        method: fetchInit.method,
        status: res.status,
        ...context,
      });
      push('error', {
        title: errorTitle ?? 'Aksi gagal',
        description: message,
        timeout: 9000,
      });
      return { ok: false, error: message };
    }

    if (successTitle) push('success', { title: successTitle, description: successDescription });
    return { ok: true, data: (body.data ?? body) as T };
  } catch (err) {
    const message = describeError(err);
    console.error(`[DompetKu] ${errorTitle ?? 'Aksi gagal'}`, {
      url,
      method: fetchInit.method,
      ...context,
      err,
    });
    push('error', { title: errorTitle ?? 'Aksi gagal', description: message, timeout: 9000 });
    return { ok: false, error: message };
  }
}

/* ============================================================================
   Tampilan
   ========================================================================== */

const ToastCard = React.memo(function ToastCard({
  toast: item,
}: {
  toast: ToastPrimitive.Root.ToastObject<{ kind: ToastKind; icon: typeof Check }>;
}) {
  const kind = (item.data?.kind ?? item.type ?? 'info') as ToastKind;
  const tone = TONE[kind];
  const Icon = tone.icon;
  const isError = kind === 'error';

  return (
    <ToastPrimitive.Root
      toast={item}
      swipeDirection={['right', 'up']}
      className={cn(
        'group pointer-events-auto relative w-full origin-bottom rounded-2xl border border-border/70 bg-popover text-popover-foreground shadow-xl',
        'ring-1',
        tone.ring,
        // Masuk dari kanan + naik pelan; keluar kebalikannya. Transisi memakai
        // transform/opacity saja agar tidak memicu layout saat animasi.
        'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'data-starting-style:translate-x-3 data-starting-style:opacity-0 data-starting-style:scale-98',
        'data-ending-style:translate-x-3 data-ending-style:opacity-0',
        'data-swipe-direction=right:data-ending-style:translate-x-24',
        'data-swipe-direction=up:data-ending-style:-translate-y-6',
        'sm:max-w-[380px]',
      )}
    >
      <ToastPrimitive.Content className="overflow-hidden rounded-2xl">
        <div className="flex items-start gap-3 p-3.5">
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm',
              tone.badge,
            )}
          >
            <Icon className={cn('size-4', kind === 'loading' && 'animate-spin')} />
          </span>

          <div className="min-w-0 flex-1 pt-0.5">
            <ToastPrimitive.Title className="text-[13.5px] font-bold leading-snug">
              {item.title}
            </ToastPrimitive.Title>
            {item.description && (
              <ToastPrimitive.Description
                className={cn(
                  'mt-0.5 text-[12px] leading-relaxed',
                  isError ? 'text-rose-700 dark:text-rose-300' : 'text-muted-foreground',
                )}
              >
                {item.description}
              </ToastPrimitive.Description>
            )}

            {item.actionProps && (
              <ToastPrimitive.Action
                className="mt-2 inline-flex h-7 items-center rounded-lg bg-muted px-2.5 text-[11.5px] font-bold text-foreground transition-colors hover:bg-border"
              />
            )}
          </div>

          <ToastPrimitive.Close
            aria-label="Tutup notifikasi"
            className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </ToastPrimitive.Close>
        </div>

        {/* Garis waktu: menunjukkan sisa durasi tampil, berhenti saat hover. */}
        {kind !== 'loading' && (
          <span
            aria-hidden="true"
            className={cn('block h-0.5 origin-left opacity-60', tone.bar)}
            style={{
              animation: `toast-countdown ${item.timeout ?? 4500}ms linear forwards`,
            }}
          />
        )}
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  );
});

/**
 * Pemasang toast global. Diletakkan sekali di root layout.
 *
 * Posisi: kanan bawah di desktop (tidak menutupi konten utama), atas tengah di
 * HP (jangkauan jempol dan tidak tertutup bottom nav).
 */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} limit={4}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-stretch gap-2 p-3 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-auto sm:w-[400px] sm:items-end sm:gap-2.5 sm:p-4">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager<{
    kind: ToastKind;
    icon: typeof Check;
  }>();
  return (
    <>
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </>
  );
}
