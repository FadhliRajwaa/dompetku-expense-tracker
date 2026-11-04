import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile-form';
import { PasswordForm } from '@/components/password-form';
import { CategoryManager } from '@/components/category-manager';
import { DangerZone } from '@/components/danger-zone';

export default async function PengaturanPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const [user, categories] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.category.findMany({ where: { OR: [{ userId }, { userId: null }] }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
  ]);
  const usage = userId
    ? await db.transaction.groupBy({ by: ['categoryId'], where: { userId }, _count: { _all: true } })
    : [];
  const usedCount = new Map(usage.map((u) => [u.categoryId, u._count._all]));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold sm:text-2xl">Pengaturan</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm name={user?.name ?? ''} email={user?.email ?? ''} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ubah Password</CardTitle></CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Kategori Saya</CardTitle></CardHeader>
        <CardContent>
          <CategoryManager
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              global: c.userId === null,
              used: usedCount.get(c.id) ?? 0,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-base text-red-700">Zona Berbahaya</CardTitle></CardHeader>
        <CardContent>
          <DangerZone email={user?.email ?? ''} />
        </CardContent>
      </Card>
    </div>
  );
}
