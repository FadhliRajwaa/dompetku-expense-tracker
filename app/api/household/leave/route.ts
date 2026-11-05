import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeAudit } from '@/lib/audit';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const membership = await db.membership.findFirst({
    where: { userId },
    include: { household: true },
  });
  if (!membership) return NextResponse.json({ error: 'Tidak tergabung' }, { status: 404 });

  const isOwner = membership.household.ownerId === userId;

  await db.$transaction(async (tx) => {
    // Dompet yang dibagikan kembali menjadi milik pribadi, agar data tidak
    // menggantung pada rumah tangga yang mungkin ditinggalkan.
    await tx.wallet.updateMany({
      where: { householdId: membership.householdId, userId },
      data: { householdId: null },
    });
    await tx.membership.delete({ where: { id: membership.id } });

    if (isOwner) {
      // Owner keluar: seluruh anggota lain dilepas dan dompet bersama
      // dikembalikan ke pemiliknya masing-masing. Rumah tangga dihapus.
      await tx.wallet.updateMany({
        where: { householdId: membership.householdId },
        data: { householdId: null },
      });
      await tx.membership.deleteMany({ where: { householdId: membership.householdId } });
      await tx.household.delete({ where: { id: membership.householdId } });
    }
  });

  await writeAudit({
    userId,
    action: 'household.leave',
    entity: 'Household',
    entityId: membership.householdId,
    summary: membership.household.name,
  });

  return NextResponse.json({ data: { ok: true, householdDeleted: isOwner } });
}
