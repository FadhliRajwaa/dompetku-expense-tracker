import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { householdJoinSchema } from '@/lib/validations';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  // Batasi percobaan: kode 8 karakter bisa ditebak bila tanpa limit.
  if (!rateLimit(req, `household:join:${userId}`, 8, 300_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = householdJoinSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await db.membership.findFirst({ where: { userId } });
  if (existing) {
    return NextResponse.json(
      { error: 'Kamu sudah tergabung dalam sebuah rumah tangga' },
      { status: 409 },
    );
  }

  const household = await db.household.findUnique({
    where: { inviteCode: parsed.data.inviteCode.toUpperCase() },
  });
  // Pesan disamakan untuk kode salah maupun tidak ada (anti-enumeration).
  if (!household) {
    return NextResponse.json({ error: 'Kode undangan tidak valid' }, { status: 404 });
  }

  await db.membership.create({
    data: { householdId: household.id, userId, role: 'MEMBER' },
  });

  await writeAudit({
    userId,
    action: 'household.join',
    entity: 'Household',
    entityId: household.id,
    summary: household.name,
  });

  return NextResponse.json({ data: { householdId: household.id, name: household.name } }, { status: 201 });
}
