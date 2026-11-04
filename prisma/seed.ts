import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const EXPENSE = [
  { name: 'Makanan', icon: 'restaurant', color: '#f97316' },
  { name: 'Transportasi', icon: 'directions_car', color: '#3b82f6' },
  { name: 'Belanja', icon: 'shopping_bag', color: '#b45309' },
  { name: 'Tagihan', icon: 'receipt', color: '#f59e0b' },
  { name: 'Hiburan', icon: 'movie', color: '#ec4899' },
  { name: 'Kesehatan', icon: 'health_and_safety', color: '#14b8a6' },
  { name: 'Pendidikan', icon: 'school', color: '#06b6d4' },
  { name: 'Lainnya', icon: 'category', color: '#71717a' },
];

const INCOME = [
  { name: 'Gaji', icon: 'payments', color: '#10b981' },
  { name: 'Bonus', icon: 'card_giftcard', color: '#10b981' },
  { name: 'Usaha', icon: 'storefront', color: '#10b981' },
  { name: 'Hadiah', icon: 'redeem', color: '#10b981' },
  { name: 'Lainnya', icon: 'category', color: '#10b981' },
];

async function main() {
  for (const c of EXPENSE) {
    const exists = await db.category.findFirst({ where: { userId: null, name: c.name, type: 'EXPENSE' } });
    if (!exists) await db.category.create({ data: { ...c, type: 'EXPENSE', userId: null } });
  }
  for (const c of INCOME) {
    const exists = await db.category.findFirst({ where: { userId: null, name: c.name, type: 'INCOME' } });
    if (!exists) await db.category.create({ data: { ...c, type: 'INCOME', userId: null } });
  }
  console.log('Seed kategori global selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
