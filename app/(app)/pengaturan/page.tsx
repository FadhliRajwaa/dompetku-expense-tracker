import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronRight,
  History,
  Palette,
  Repeat,
  Target,
  Users,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm } from '@/components/profile-form';
import { PasswordForm } from '@/components/password-form';
import { CategoryManager } from '@/components/category-manager';
import { DangerZone } from '@/components/danger-zone';
import { PreferencesForm } from '@/components/preferences-form';
import { Reveal } from '@/components/motion/reveal';

function Section({
  icon: Icon,
  title,
  desc,
  children,
  tone = 'default',
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
}) {
  const danger = tone === 'danger';
  return (
    <section
      className={`rounded-2xl border bg-card shadow-xs ${
        danger ? 'border-rose-500/25' : 'border-border/70'
      } ${className ?? ''}`}
    >
      <header className="flex items-start gap-3 px-5 pt-5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
              : 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
          }`}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h2 className={`text-[14.5px] font-bold ${danger ? 'text-rose-700 dark:text-rose-300' : ''}`}>
            {title}
          </h2>
          <p className="text-[12px] leading-snug text-muted-foreground">{desc}</p>
        </div>
      </header>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </section>
  );
}

const SHORTCUTS = [
  { href: '/target', icon: Target, t: 'Target tabungan', d: 'Sisihkan dana untuk tujuan' },
  { href: '/berulang', icon: Repeat, t: 'Transaksi berulang', d: 'Gaji, sewa, langganan otomatis' },
  { href: '/keluarga', icon: Users, t: 'Rumah tangga', d: 'Bagikan dompet dengan keluarga' },
  { href: '/aktivitas', icon: History, t: 'Riwayat aktivitas', d: 'Jejak perubahan akun' },
];

export default async function PengaturanPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const [user, categories] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    }),
  ]);
  const usage = await db.transaction.groupBy({
    by: ['categoryId'],
    where: { userId },
    _count: { _all: true },
  });
  const usedCount = new Map(usage.map((u) => [u.categoryId, u._count._all]));
  const isGoogleOnly = !user?.passwordHash;
  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          Akun
        </p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Pengaturan</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Kelola profil, keamanan, dan preferensi akun
        </p>
      </div>

      {/* Kartu identitas */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[16px] font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-bold">{user?.name}</p>
            <p className="truncate text-[12.5px] text-muted-foreground">{user?.email}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
              isGoogleOnly
                ? 'bg-muted text-muted-foreground'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            }`}
          >
            {isGoogleOnly ? 'Google' : 'Email & kata sandi'}
          </span>
        </div>
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-2" stagger={0.08}>
        <div className="reveal-item">
          <Section icon={Palette} title="Profil" desc="Nama yang tampil di dashboard">
            <ProfileForm name={user?.name ?? ''} email={user?.email ?? ''} />
          </Section>
        </div>

        <div className="reveal-item">
          <Section
            icon={AlertTriangle}
            title="Kata sandi"
            desc={
              isGoogleOnly
                ? 'Akun ini masuk lewat Google — kata sandi belum diatur'
                : 'Ganti kata sandi secara berkala'
            }
          >
            <PasswordForm />
          </Section>
        </div>
      </Reveal>

      <Reveal className="grid gap-4 lg:grid-cols-2" stagger={0.08}>
        <div className="reveal-item">
          <Section icon={Palette} title="Tampilan & mata uang" desc="Tema dan acuan konversi">
            <PreferencesForm initialCurrency={user?.currency ?? 'IDR'} />
          </Section>
        </div>

        <div className="reveal-item">
          <Section icon={CalendarClock} title="Fitur lainnya" desc="Alat lain yang tersedia">
            <ul className="divide-y divide-border/60">
              {SHORTCUTS.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group flex items-center gap-3 py-2.5 transition-colors hover:text-brand-700 dark:hover:text-brand-400"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/40 dark:group-hover:text-brand-300">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight">{l.t}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{l.d}</p>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>
      </Reveal>

      <Reveal>
        <Section icon={Target} title="Kategori" desc="Kategori bawaan dan milikmu sendiri">
          <CategoryManager
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              global: c.userId === null,
              used: usedCount.get(c.id) ?? 0,
            }))}
          />
        </Section>
      </Reveal>

      <Reveal>
        <Section
          icon={AlertTriangle}
          title="Hapus akun"
          desc="Menghapus seluruh dompet, transaksi, dan anggaran secara permanen"
          tone="danger"
        >
          <DangerZone email={user?.email ?? ''} />
        </Section>
      </Reveal>

      <Link
        href="/"
        className="group inline-flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        Kembali ke beranda
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
