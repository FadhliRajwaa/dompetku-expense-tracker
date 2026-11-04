import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { walletSchema } from '@/lib/validations';

async function owned(userId: string, id: string) {
  return db.wallet.findFirst({ where: { id, userId } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await owned(userId, id);
  if (!existing) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const parsed = walletSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const data = await db.wallet.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await owned(userId, id);
  if (!existing) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const data = await db.wallet.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ data });
}
