import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { rateLimit, rateLimitedResponse, readJson } from '@/lib/rate-limit';

const schema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi').max(72),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(72),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  // 5x ganti password / 10 menit / akun — hambat takeover via session curian
  if (!rateLimit(req, `account:password:${userId}`, 5, 600_000)) return rateLimitedResponse();
  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.passwordHash) {
    return NextResponse.json({ error: 'Akun ini login via Google, tidak memiliki password' }, { status: 400 });
  }
  const ok = await bcrypt.compare(parsed.data.oldPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
  return NextResponse.json({ data: { ok: true } });
}
