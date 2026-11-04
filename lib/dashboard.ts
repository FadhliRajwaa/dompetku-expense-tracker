import { db } from './db';
import { getBudgetStatus } from './finance';

export interface DashboardFilter {
  userId: string;
  month: number; // 1-12
  year: number;
}

export async function getDashboardData({ userId, month, year }: DashboardFilter) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 86400000);
  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1);

  const [wallets, txns, txnsPrev, recentRaw, budgets] = await Promise.all([
    db.wallet.findMany({ where: { userId, isActive: true } }),
    db.transaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
    }),
    db.transaction.findMany({ where: { userId, date: { gte: prevStart, lt: prevEnd } } }),
    db.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    db.budget.findMany({ where: { userId, month, year } }),
  ]);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const recent = recentRaw.map((t) => ({ ...t, wallet: walletMap.get(t.walletId) ?? null }));

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const sum = (list: typeof txns, type: 'INCOME' | 'EXPENSE') =>
    list.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);
  const income = sum(txns, 'INCOME');
  const expense = sum(txns, 'EXPENSE');
  const incomePrev = sum(txnsPrev, 'INCOME');
  const expensePrev = sum(txnsPrev, 'EXPENSE');
  const pct = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100);

  // Arus kas 30 hari
  const last30Txns = await db.transaction.findMany({
    where: { userId, date: { gte: last30, lte: now } },
    orderBy: { date: 'asc' },
  });
  const days: { date: string; masuk: number; keluar: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const dayTx = last30Txns.filter((t) => t.date.toISOString().slice(0, 10) === key);
    days.push({
      date: key,
      masuk: dayTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
      keluar: dayTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
    });
  }

  // Per kategori expense + budget progress
  const catIds = [...new Set(txns.filter((t) => t.type === 'EXPENSE').map((t) => t.categoryId))];
  const cats = catIds.length
    ? await db.category.findMany({ where: { id: { in: catIds } } })
    : [];
  const perCategory = cats.map((c) => {
    const total = txns.filter((t) => t.type === 'EXPENSE' && t.categoryId === c.id).reduce((s, t) => s + Number(t.amount), 0);
    return { id: c.id, name: c.name, color: c.color, icon: c.icon, total, percent: expense > 0 ? (total / expense) * 100 : 0 };
  }).sort((a, b) => b.total - a.total);

  // Satu groupBy untuk semua budget (hindari N+1), + satu fetch kategori
  const budgetCatIds = [...new Set(budgets.map((b) => b.categoryId))];
  const [budgetSums, budgetCats] = await Promise.all([
    budgetCatIds.length
      ? db.transaction.groupBy({
          by: ['categoryId'],
          where: { userId, categoryId: { in: budgetCatIds }, type: 'EXPENSE', date: { gte: start, lt: end } },
          _sum: { amount: true },
        })
      : Promise.resolve([] as { categoryId: string; _sum: { amount: unknown } }[]),
    budgetCatIds.length ? db.category.findMany({ where: { id: { in: budgetCatIds } } }) : Promise.resolve([]),
  ]);
  const usedByCat = new Map(budgetSums.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));
  const catById = new Map(budgetCats.map((c) => [c.id, c]));

  const budgetProgress = budgets.map((b) => {
      const usedNum = usedByCat.get(b.categoryId) ?? 0;
      const limitNum = Number(b.limit);
      const percent = limitNum > 0 ? (usedNum / limitNum) * 100 : 0;
      const cat = catById.get(b.categoryId);
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: cat?.name ?? '-',
        color: cat?.color ?? '#2fa084',
        used: usedNum,
        limit: limitNum,
        percent,
        status: getBudgetStatus(percent),
        remaining: limitNum - usedNum,
      };
    });

  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit), 0);
  const remainingBudget = totalLimit - budgetProgress.reduce((s, b) => s + b.used, 0);

  return {
    totalBalance,
    income,
    expense,
    incomeChangePct: pct(income, incomePrev),
    expenseChangePct: pct(expense, expensePrev),
    remainingBudget,
    cashflow30: days,
    perCategory,
    budgetProgress: budgetProgress.sort((a, b) => b.percent - a.percent),
    recent,
    activeWallets: wallets.length,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
