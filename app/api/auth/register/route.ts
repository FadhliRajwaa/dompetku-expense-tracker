import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { rateLimit, rateLimitedResponse, readJson } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // 10x register / 10 menit / IP — hambat pembuatan akun massal
  if (!rateLimit(req, 'auth:register', 10, 600_000)) return rateLimitedResponse();
  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });
  const parsed = registerSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
  });
  return NextResponse.json({ data: { id: user.id } }, { status: 201 });
}
