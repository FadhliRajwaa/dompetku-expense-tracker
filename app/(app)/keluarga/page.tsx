import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HouseholdManager } from '@/components/household-manager';

export const metadata = { title: 'Rumah Tangga' };

export default async function KeluargaPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [membership, wallets] = await Promise.all([
    db.membership.findFirst({
      where: { userId },
      include: {
        household: {
          include: {
            memberships: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            wallets: { where: { isActive: true } },
          },
        },
      },
    }),
    db.wallet.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'asc' } }),
  ]);

  const household = membership
    ? {
        id: membership.household.id,
        name: membership.household.name,
        inviteCode: membership.household.inviteCode,
        isOwner: membership.household.ownerId === userId,
        role: membership.role as 'OWNER' | 'MEMBER',
        members: membership.household.memberships.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role as 'OWNER' | 'MEMBER',
          joinedAt: m.createdAt.toISOString(),
        })),
        wallets: membership.household.wallets.map((w) => ({
          id: w.id,
          name: w.name,
          balance: Number(w.balance),
          type: w.type,
        })),
      }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Bersama</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight sm:text-[2.35rem]">Rumah tangga</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Bagikan dompet tertentu dengan pasangan atau keluarga tanpa mengorbankan privasi
        </p>
      </div>

      <HouseholdManager
        household={household}
        wallets={wallets.map((w) => ({
          id: w.id,
          name: w.name,
          isShared: w.householdId === household?.id && household !== null,
        }))}
      />
    </div>
  );
}
