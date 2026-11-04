import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const data = await db.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const exists = await db.category.findFirst({
    where: { userId, name: parsed.data.name, type: parsed.data.type },
  });
  if (exists) return NextResponse.json({ error: 'Kategori dengan nama ini sudah ada' }, { status: 409 });
  const data = await db.category.create({ data: { ...parsed.data, userId } });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID kategori wajib diisi' }, { status: 400 });
  const existing = await db.category.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  const [txCount, budCount] = await Promise.all([
    db.transaction.count({ where: { userId, categoryId: id } }),
    db.budget.count({ where: { userId, categoryId: id } }),
  ]);
  if (txCount > 0 || budCount > 0) {
    return NextResponse.json({ error: 'Kategori sudah dipakai, tidak bisa dihapus agar riwayat tetap utuh' }, { status: 400 });
  }
  await db.category.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
