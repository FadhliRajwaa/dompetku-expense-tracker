import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm } from '@/components/profile-form';
import { PasswordForm } from '@/components/password-form';
import { CategoryManager } from '@/components/category-manager';
import { DangerZone } from '@/components/danger-zone';

function Section({
  icon,
  title,
  desc,
  children,
  tone = 'default',
}: {
  icon: string;
  title: string;
  desc: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  const danger = tone === 'danger';
  return (
    <section
      className={`rounded-2xl border bg-card shadow-xs ${
        danger ? 'border-rose-500/25' : 'border-border/70'
      }`}
    >
      <header className="flex items-start gap-3 px-5 pt-5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            danger ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <div>
          <h2 className={`text-[14.5px] font-bold ${danger ? 'text-rose-700' : ''}`}>{title}</h2>
          <p className="text-[12px] leading-snug text-muted-foreground">{desc}</p>
        </div>
      </header>
      <div className="px-5 pb-5 pt-4">{children}</div>
    </section>
  );
}

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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Akun</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Pengaturan</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Kelola profil, keamanan, dan preferensi akun</p>
      </div>

      {/* Identitas ringkas */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[16px] font-bold text-white">
          {(user?.name ?? '?')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('')}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-bold">{user?.name}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{user?.email}</p>
        </div>
        <span
          className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${
            isGoogleOnly ? 'bg-muted text-muted-foreground' : 'bg-brand-50 text-brand-700'
          }`}
        >
          {isGoogleOnly ? 'Google' : 'Email & password'}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon="person" title="Profil" desc="Nama yang tampil di dashboard">
          <ProfileForm name={user?.name ?? ''} email={user?.email ?? ''} />
        </Section>

        <Section
          icon="lock"
          title="Kata sandi"
          desc={isGoogleOnly ? 'Akun ini masuk lewat Google' : 'Ganti kata sandi secara berkala'}
        >
          <PasswordForm />
        </Section>
      </div>

      <Section icon="category" title="Kategori" desc="Kategori bawaan dan milikmu sendiri">
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

      <Section
        icon="warning"
        title="Hapus akun"
        desc="Menghapus seluruh dompet, transaksi, dan budget secara permanen"
        tone="danger"
      >
        <DangerZone email={user?.email ?? ''} />
      </Section>
    </div>
  );
}
