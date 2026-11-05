import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { goalSchema } from '@/lib/validations';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const data = await db.goal.findMany({
    where: { userId, isArchived: false },
    orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }],
    include: { entries: { orderBy: { date: 'desc' }, take: 5 } },
  });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  if (!rateLimit(req, `goals:create:${userId}`, 20, 60_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = goalSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = await db.goal.create({
    data: {
      userId,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currency: parsed.data.currency,
      targetDate: parsed.data.targetDate ?? null,
      icon: parsed.data.icon,
      color: parsed.data.color,
    },
  });

  await writeAudit({
    userId,
    action: 'goal.create',
    entity: 'Goal',
    entityId: data.id,
    summary: `${data.name} · target ${parsed.data.currency} ${parsed.data.targetAmount.toLocaleString('id-ID')}`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
