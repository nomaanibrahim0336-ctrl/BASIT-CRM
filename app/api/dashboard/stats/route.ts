import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, serialize, validateAuth } from "@/lib/api-utils";
import { BalanceStatus, DealStage, LeadStatus, UserRole } from "@/types/enums";

export async function GET(_request: NextRequest) {
  try {
    const teamMember = await validateAuth();

    if (teamMember.role === UserRole.ADMIN) {
      const [
        totalLeads,
        newLeads,
        totalDeals,
        activeDeals,
        pendingBalance,
        dealsByStage,
        revenueThisMonth,
      ] = await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { leadStatus: LeadStatus.NEW } }),
        prisma.deal.count(),
        prisma.deal.count({
          where: {
            dealStage: {
              in: [DealStage.DESIGN_BRIEFED, DealStage.IN_PROGRESS, DealStage.IN_REVISION],
            },
          },
        }),
        prisma.deal.aggregate({
          where: { balanceStatus: BalanceStatus.PENDING },
          _sum: { balancePayment: true },
        }),
        prisma.deal.groupBy({ by: ["dealStage"], _count: { _all: true } }),
        prisma.revenueLog.aggregate({
          where: {
            dateReceived: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amountReceived: true },
        }),
      ]);

      return NextResponse.json(
        serialize({
          totalLeads,
          newLeads,
          totalDeals,
          activeDeals,
          pendingBalanceTotal: pendingBalance._sum.balancePayment ?? 0,
          revenueThisMonth: revenueThisMonth._sum.amountReceived ?? 0,
          dealsByStage,
        })
      );
    }

    if (teamMember.role === UserRole.LEAD_GENERATOR) {
      const [totalGenerated, byStatus] = await Promise.all([
        prisma.lead.count({ where: { generatedById: teamMember.id } }),
        prisma.lead.groupBy({
          by: ["leadStatus"],
          where: { generatedById: teamMember.id },
          _count: { _all: true },
        }),
      ]);

      return NextResponse.json(serialize({ totalGenerated, byStatus }));
    }

    if (teamMember.role === UserRole.SALES_CLOSER) {
      const [assignedLeads, assignedDeals, activeDeals] = await Promise.all([
        prisma.lead.count({ where: { assignedCloserId: teamMember.id } }),
        prisma.deal.count({ where: { assignedCloserId: teamMember.id } }),
        prisma.deal.count({
          where: {
            assignedCloserId: teamMember.id,
            dealStage: {
              in: [DealStage.DESIGN_BRIEFED, DealStage.IN_PROGRESS, DealStage.IN_REVISION],
            },
          },
        }),
      ]);

      return NextResponse.json(serialize({ assignedLeads, assignedDeals, activeDeals }));
    }

    if (teamMember.role === UserRole.DESIGNER) {
      const [assigned, byStage] = await Promise.all([
        prisma.deal.count({ where: { assignedDesignerId: teamMember.id } }),
        prisma.deal.groupBy({
          by: ["dealStage"],
          where: { assignedDesignerId: teamMember.id },
          _count: { _all: true },
        }),
      ]);

      return NextResponse.json(serialize({ assigned, byStage }));
    }

    if (teamMember.role === UserRole.MERCHANT) {
      const [revenueThisMonth, expensesThisMonth, pendingBalance] = await Promise.all([
        prisma.revenueLog.aggregate({
          where: {
            dateReceived: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amountReceived: true },
        }),
        prisma.expense.aggregate({
          where: {
            dateIncurred: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
        prisma.deal.aggregate({
          where: { balanceStatus: BalanceStatus.PENDING },
          _sum: { balancePayment: true },
        }),
      ]);

      return NextResponse.json(
        serialize({
          revenueThisMonth: revenueThisMonth._sum.amountReceived ?? 0,
          expensesThisMonth: expensesThisMonth._sum.amount ?? 0,
          pendingBalanceTotal: pendingBalance._sum.balancePayment ?? 0,
        })
      );
    }

    return NextResponse.json({});
  } catch (error) {
    return handleApiError(error);
  }
}
