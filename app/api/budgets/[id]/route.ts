import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budgetSchema } from '@/lib/validations';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await db.budget.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Budget tidak ditemukan' }, { status: 404 });
  const parsed = budgetSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  try {
    const data = await db.budget.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Budget kategori ini sudah ada di bulan tersebut' }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await db.budget.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Budget tidak ditemukan' }, { status: 404 });
  await db.budget.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
