import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeAudit } from '@/lib/audit';

const patchSchema = z.object({
  action: z.enum(['pause', 'resume']).optional(),
  amount: z.number().positive().max(999_000_000_000).optional(),
  note: z.string().max(200).optional().nullable(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  // Ownership: cari dulu dengan userId, jangan update langsung by id.
  const rule = await db.recurringRule.findFirst({ where: { id, userId } });
  if (!rule) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.action === 'pause') data.status = 'PAUSED';
  if (parsed.data.action === 'resume') data.status = 'ACTIVE';
  if (parsed.data.amount !== undefined) data.amount = parsed.data.amount;
  if (parsed.data.note !== undefined) data.note = parsed.data.note;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
  }

  const updated = await db.recurringRule.update({ where: { id }, data });

  if (parsed.data.action) {
    await writeAudit({
      userId,
      action: parsed.data.action === 'pause' ? 'recurring.pause' : 'recurring.resume',
      entity: 'RecurringRule',
      entityId: id,
      summary: rule.note ?? 'Transaksi berulang',
    });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  const rule = await db.recurringRule.findFirst({ where: { id, userId } });
  if (!rule) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  // Transaksi yang sudah terlanjur dibuat TETAP ada (riwayat nyata);
  // relasi recurringRuleId di-set null lewat onDelete: SetNull.
  await db.recurringRule.delete({ where: { id } });
  await writeAudit({
    userId,
    action: 'recurring.delete',
    entity: 'RecurringRule',
    entityId: id,
    summary: rule.note ?? 'Transaksi berulang',
  });

  return NextResponse.json({ data: { ok: true } });
}
