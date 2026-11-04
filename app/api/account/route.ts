import { NextResponse } from 'next/server';
import { auth, signOut } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  // Hapus manual per tabel agar tidak bergantung pada onDelete DB;
  // urutan: anak dulu, user terakhir.
  await db.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.transfer.deleteMany({ where: { userId } });
    await tx.budget.deleteMany({ where: { userId } });
    await tx.wallet.deleteMany({ where: { userId } });
    await tx.category.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
  await signOut({ redirect: false });
  return NextResponse.json({ data: { ok: true } });
}
