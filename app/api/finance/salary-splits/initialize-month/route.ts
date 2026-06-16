import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { payrollInitializeSchema } from "@/lib/validations";
import { MemberStatus, PaidStatus, PayPeriod, SplitType, UserRole } from "@/types/enums";

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const body = await request.json();
    const { periodMonth } = payrollInitializeSchema.parse(body);

    const members = await prisma.team.findMany({
      where: { status: MemberStatus.ACTIVE },
    });

    const created = [];

    for (const member of members) {
      const hasFixed = member.fixedSalary != null;
      const hasCommission = member.commissionRate != null;
      if (!hasFixed && !hasCommission) continue;

      const existing = await prisma.salarySplit.findFirst({
        where: { teamMemberId: member.id, periodMonth },
      });
      if (existing) continue;

      const isHybrid = hasFixed && hasCommission;
      const splitType = isHybrid
        ? SplitType.HYBRID
        : hasFixed
        ? SplitType.FIXED_SALARY
        : SplitType.COMMISSION;

      const split = await prisma.salarySplit.create({
        data: {
          teamMemberId: member.id,
          splitType: splitType as any,
          splitAmount: member.fixedSalary ?? 0,
          splitPercentage: member.commissionRate,
          payPeriod: PayPeriod.MONTHLY as any,
          paidStatus: PaidStatus.UNPAID as any,
          periodMonth,
        },
        include: { teamMember: true, deal: true, adjustments: true },
      });

      created.push(split);
    }

    return NextResponse.json(serialize({ created: created.length, data: created }), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
