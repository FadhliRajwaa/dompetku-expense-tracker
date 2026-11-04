import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { budgetSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const q = new URL(req.nextUrl).searchParams;
  const month = Number(q.get('month') ?? new Date().getMonth() + 1);
  const year = Number(q.get('year') ?? new Date().getFullYear());
  const data = await db.budget.findMany({ where: { userId, month, year } });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const parsed = budgetSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const category = await db.category.findFirst({
    where: { id: parsed.data.categoryId, OR: [{ userId }, { userId: null }] },
  });
  if (!category) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  try {
    const data = await db.budget.create({ data: { ...parsed.data, userId } });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Budget kategori ini sudah ada di bulan tersebut' }, { status: 409 });
    }
    throw e;
  }
}
