import { prisma } from "@/lib/prisma";
import { ExpenseType, PaidStatus } from "@/types/enums";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Aggregates revenue, expenses, and salary payouts for the given month/year
 * and upserts the corresponding MonthlyPnL record.
 */
export async function calculateMonthlyPnL(year: number, monthIndex: number) {
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1));
  const monthName = MONTH_NAMES[monthIndex];

  const [revenueAgg, fixedExpenseAgg, variableExpenseAgg, salaryAgg] = await Promise.all([
    prisma.revenueLog.aggregate({
      where: { dateReceived: { gte: monthStart, lt: monthEnd } },
      _sum: { amountReceived: true },
    }),
    prisma.expense.aggregate({
      where: {
        dateIncurred: { gte: monthStart, lt: monthEnd },
        expenseType: ExpenseType.FIXED,
      },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: {
        dateIncurred: { gte: monthStart, lt: monthEnd },
        expenseType: ExpenseType.VARIABLE,
      },
      _sum: { amount: true },
    }),
    prisma.salarySplit.aggregate({
      where: {
        datePaid: { gte: monthStart, lt: monthEnd },
        paidStatus: PaidStatus.PAID,
      },
      _sum: { splitAmount: true },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.amountReceived?.toNumber() ?? 0;
  const totalFixedExpenses = fixedExpenseAgg._sum.amount?.toNumber() ?? 0;
  const totalVariableExpenses = variableExpenseAgg._sum.amount?.toNumber() ?? 0;
  const totalSalaryPayouts = salaryAgg._sum.splitAmount?.toNumber() ?? 0;

  const totalExpenses = totalFixedExpenses + totalVariableExpenses + totalSalaryPayouts;
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return prisma.monthlyPnL.upsert({
    where: { month_year: { month: monthName, year } },
    create: {
      month: monthName,
      year,
      totalRevenue,
      totalFixedExpenses,
      totalVariableExpenses,
      totalSalaryPayouts,
      netProfit,
      profitMarginPct,
    },
    update: {
      totalRevenue,
      totalFixedExpenses,
      totalVariableExpenses,
      totalSalaryPayouts,
      netProfit,
      profitMarginPct,
    },
  });
}

export async function calculateCurrentMonthPnL() {
  const now = new Date();
  return calculateMonthlyPnL(now.getUTCFullYear(), now.getUTCMonth());
}
