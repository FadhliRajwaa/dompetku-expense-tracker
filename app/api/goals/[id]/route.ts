import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeAudit } from '@/lib/audit';

const patchSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  targetAmount: z.number().positive().max(999_000_000_000).optional(),
  targetDate: z.coerce.date().optional().nullable(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  const goal = await db.goal.findFirst({ where: { id, userId } });
  if (!goal) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
  }

  const updated = await db.goal.update({ where: { id }, data: parsed.data });
  await writeAudit({
    userId,
    action: 'goal.update',
    entity: 'Goal',
    entityId: id,
    summary: updated.name,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  const goal = await db.goal.findFirst({ where: { id, userId } });
  if (!goal) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  // Arsipkan, bukan hapus fisik: riwayat setoran tetap tersimpan.
  await db.goal.update({ where: { id }, data: { isArchived: true } });
  await writeAudit({
    userId,
    action: 'goal.delete',
    entity: 'Goal',
    entityId: id,
    summary: goal.name,
  });

  return NextResponse.json({ data: { ok: true } });
}
