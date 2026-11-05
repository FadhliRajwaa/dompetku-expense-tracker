import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { householdCreateSchema } from '@/lib/validations';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';

/** Buat kode undangan pendek, mudah dibaca & dibagikan. */
function makeInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I agar tidak ambigu
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const membership = await db.membership.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          memberships: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
          wallets: { where: { isActive: true }, select: { id: true, name: true, balance: true, type: true } },
        },
      },
    },
  });

  if (!membership) return NextResponse.json({ data: null });

  const h = membership.household;
  return NextResponse.json({
    data: {
      id: h.id,
      name: h.name,
      inviteCode: h.inviteCode,
      isOwner: h.ownerId === userId,
      role: membership.role,
      members: h.memberships.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
        joinedAt: m.createdAt,
      })),
      wallets: h.wallets.map((w) => ({ ...w, balance: Number(w.balance) })),
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  if (!rateLimit(req, `household:create:${userId}`, 5, 300_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = householdCreateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Satu user hanya boleh berada di satu rumah tangga (hindari konflik saldo).
  const existing = await db.membership.findFirst({ where: { userId } });
  if (existing) {
    return NextResponse.json(
      { error: 'Kamu sudah tergabung dalam sebuah rumah tangga' },
      { status: 409 },
    );
  }

  // Kode unik — ulangi bila kebetulan sudah dipakai.
  let inviteCode = makeInviteCode();
  for (let i = 0; i < 5; i++) {
    const clash = await db.household.findUnique({ where: { inviteCode } });
    if (!clash) break;
    inviteCode = makeInviteCode();
  }

  const household = await db.$transaction(async (tx) => {
    const h = await tx.household.create({
      data: { name: parsed.data.name, ownerId: userId, inviteCode },
    });
    await tx.membership.create({
      data: { householdId: h.id, userId, role: 'OWNER' },
    });
    return h;
  });

  await writeAudit({
    userId,
    action: 'household.create',
    entity: 'Household',
    entityId: household.id,
    summary: household.name,
  });

  return NextResponse.json({ data: household }, { status: 201 });
}
