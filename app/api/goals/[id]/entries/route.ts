import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { goalEntrySchema } from '@/lib/validations';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';

/**
 * Setor / tarik dana pada target tabungan.
 *
 * Beda dengan transaksi biasa: menyimpan ke target TIDAK mengubah saldo dompet,
 * karena dana tabungan tetap milik pengguna — hanya dialokasikan. Yang berubah
 * adalah `savedAmount` pada goal. Ini mencegah saldo dompet tampak turun padahal
 * uangnya masih ada.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await ctx.params;

  if (!rateLimit(req, `goal-entry:${userId}`, 40, 60_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = goalEntrySchema.safeParse({ ...(body.data as object), goalId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const v = parsed.data;

  const goal = await db.goal.findFirst({ where: { id, userId, isArchived: false } });
  if (!goal) return NextResponse.json({ error: 'Target tidak ditemukan' }, { status: 404 });

  const saved = Number(goal.savedAmount);
  if (v.type === 'WITHDRAW' && v.amount > saved) {
    return NextResponse.json(
      { error: `Dana tersimpan hanya ${saved.toLocaleString('id-ID')}. Tidak bisa menarik lebih.` },
      { status: 400 },
    );
  }

  // Cegah setoran melebihi target (boleh pas, tidak boleh lewat).
  if (v.type === 'DEPOSIT' && saved + v.amount > Number(goal.targetAmount)) {
    const remaining = Number(goal.targetAmount) - saved;
    return NextResponse.json(
      {
        error: `Setoran melebihi target. Sisa yang dibutuhkan ${remaining.toLocaleString('id-ID')}.`,
      },
      { status: 400 },
    );
  }

  const delta = v.type === 'DEPOSIT' ? v.amount : -v.amount;

  const result = await db.$transaction(async (tx) => {
    const entry = await tx.goalEntry.create({
      data: {
        goalId: goal.id,
        userId,
        amount: v.amount,
        type: v.type,
        note: v.note,
        date: v.date ?? new Date(),
      },
    });
    const updated = await tx.goal.update({
      where: { id: goal.id },
      data: { savedAmount: { increment: delta } },
    });
    return { entry, goal: updated };
  });

  await writeAudit({
    userId,
    action: v.type === 'DEPOSIT' ? 'goal.deposit' : 'goal.withdraw',
    entity: 'Goal',
    entityId: goal.id,
    summary: `${goal.name} · ${v.type === 'DEPOSIT' ? 'setor' : 'tarik'} ${v.amount.toLocaleString('id-ID')}`,
  });

  return NextResponse.json({ data: result }, { status: 201 });
}
