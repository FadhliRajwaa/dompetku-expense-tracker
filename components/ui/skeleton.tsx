import * as React from 'react';
import { cn } from 'cn';

/**
 * Kerangka pemuatan.
 *
 * Bentuknya meniru tata letak akhir — lebar, tinggi, dan jarak yang sama —
 * sehingga tidak ada lompatan tata letak saat data datang. Semua teks di
 * dalamnya `aria-hidden`; pembaca layar cukup diberi tahu lewat satu
 * `role="status"` di komponen pembungkus halaman.
 */
export function Skeleton({
  className,
  rounded,
  width,
  height,
}: {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  width?: string | number;
  height?: string | number;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'skeleton block',
        rounded === 'full' && 'rounded-full',
        rounded === 'sm' && 'rounded-sm',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'xl' && 'rounded-xl',
        rounded === '2xl' && 'rounded-2xl',
        className,
      )}
      style={{ width, height }}
    />
  );
}

/** Baris teks: bar terakhir dibuat lebih pendek seperti paragraf asli. */
export function SkeletonText({
  lines = 3,
  className,
  lineHeight = 12,
}: {
  lines?: number;
  className?: string;
  lineHeight?: number;
}) {
  return (
    <span className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          height={lineHeight}
          width={i === lines - 1 ? '62%' : i % 3 === 0 ? '100%' : '88%'}
        />
      ))}
    </span>
  );
}

/** Kartu ringkasan (angka besar di atas, label kecil di bawah). */
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-card px-4 py-3 shadow-xs',
        className,
      )}
    >
      <Skeleton width="42%" height={9} className="mb-2.5" />
      <Skeleton width="68%" height={18} />
    </div>
  );
}

/** Satu baris daftar: ikon bulat, dua baris teks, nilai di kanan. */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-2.5', className)}>
      <Skeleton className="size-9 shrink-0" rounded="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton width={`${52 + ((Math.random() * 3) | 0) * 8}%`} height={11} />
        <Skeleton width="34%" height={8} />
      </div>
      <Skeleton className="shrink-0" width={64} height={12} />
    </div>
  );
}

/** Header halaman: eyebrow, judul besar, subjudul. */
export function SkeletonPageHead() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <Skeleton width={84} height={9} />
      <Skeleton width="min(320px, 62%)" height={30} className="mt-0.5" />
      <Skeleton width="min(240px, 44%)" height={11} />
    </div>
  );
}

/**
 * Pembungkus status untuk pembaca layar. Diletakkan sekali per halaman.
 * Teksnya tidak terlihat tetapi memastikan ada pengumuman yang benar.
 */
export function LoadingAnnouncer({ label = 'Memuat data' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}…
    </span>
  );
}
