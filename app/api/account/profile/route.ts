import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';

const schema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  if (!rateLimit(req, `account:profile:${userId}`, 20, 60_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 });
  }

  const data = await db.user.update({
    where: { id: userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, theme: true, currency: true },
  });

  await writeAudit({
    userId,
    action: 'account.profile',
    entity: 'User',
    entityId: userId,
    summary: Object.keys(parsed.data).join(', '),
  });

  return NextResponse.json({ data });
}
