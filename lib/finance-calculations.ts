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
const DEFAULT_USD_TO_PKR_RATE = 280;

/**
 * Returns the exchange rate effective at (on or before) the given date,
 * falling back to the most recent rate ever set, or a default.
 */
export async function getExchangeRate(asOf: Date = new Date()): Promise<number> {
  const rate = await prisma.exchangeRate.findFirst({
    where: { effectiveDate: { lte: asOf } },
    orderBy: { effectiveDate: "desc" },
  });
  if (rate) return rate.rate.toNumber();

  const latest = await prisma.exchangeRate.findFirst({ orderBy: { effectiveDate: "desc" } });
  if (latest) return latest.rate.toNumber();

  return DEFAULT_USD_TO_PKR_RATE;
}

export async function calculateMonthlyPnL(year: number, monthIndex: number) {
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1));
  const monthName = MONTH_NAMES[monthIndex];

  const [revenueAgg, fixedExpenseAgg, variableExpenseAgg, salaryAgg, exchangeRate] = await Promise.all([
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
    getExchangeRate(monthEnd),
  ]);

  // Client revenue is logged in USD; convert to PKR using the exchange rate
  // for the period. Expenses and salaries are already entered in PKR.
  const totalRevenueUsd = revenueAgg._sum.amountReceived?.toNumber() ?? 0;
  const totalRevenue = totalRevenueUsd * exchangeRate;
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
      totalRevenueUsd,
      exchangeRate,
      totalFixedExpenses,
      totalVariableExpenses,
      totalSalaryPayouts,
      netProfit,
      profitMarginPct,
    },
    update: {
      totalRevenue,
      totalRevenueUsd,
      exchangeRate,
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
