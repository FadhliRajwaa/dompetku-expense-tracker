import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readJson } from '@/lib/rate-limit';

const schema = z.object({ name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50) });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const data = await db.user.update({ where: { id: (session.user as { id: string }).id }, data: { name: parsed.data.name } });
  return NextResponse.json({ data: { id: data.id, name: data.name } });
}
