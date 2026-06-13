import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { DealStage, UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

const ACTIVE_STAGES = [
  DealStage.DESIGN_BRIEFED,
  DealStage.IN_PROGRESS,
  DealStage.IN_REVISION,
] as const;

export async function GET(_request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.DESIGNER]);

    const where: Prisma.DealWhereInput = {
      dealStage: { in: ACTIVE_STAGES as unknown as DealStage[] },
    };

    if (teamMember.role === UserRole.DESIGNER) {
      where.assignedDesignerId = teamMember.id;
    }

    const deals = await prisma.deal.findMany({
      where,
      orderBy: [{ priority: "asc" }, { deadline: "asc" }],
      include: { lead: true, assignedDesigner: true, assignedCloser: true },
    });

    return NextResponse.json(serialize(deals));
  } catch (error) {
    return handleApiError(error);
  }
}
