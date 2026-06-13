import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  buildPaginatedResponse,
  handleApiError,
  parsePagination,
  serialize,
  validateAuth,
  validateRole,
} from "@/lib/api-utils";
import { salarySplitCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.SalarySplitWhereInput = {};

    if (teamMember.role !== UserRole.ADMIN) {
      where.teamMemberId = teamMember.id;
    }

    const paidStatus = searchParams.get("paidStatus");
    if (paidStatus) where.paidStatus = paidStatus as Prisma.EnumPaidStatusFilter["equals"];

    const [data, totalCount] = await Promise.all([
      prisma.salarySplit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { teamMember: true, deal: true },
      }),
      prisma.salarySplit.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const body = await request.json();
    const parsed = salarySplitCreateSchema.parse(body);

    const salarySplit = await prisma.salarySplit.create({
      data: {
        splitType: parsed.splitType as any,
        splitAmount: parsed.splitAmount,
        splitPercentage: parsed.splitPercentage,
        payPeriod: parsed.payPeriod as any,
        paidStatus: parsed.paidStatus as any,
        datePaid: parsed.datePaid,
        notes: parsed.notes,
        teamMemberId: parsed.teamMemberId,
        dealId: parsed.dealId,
      },
      include: { teamMember: true, deal: true },
    });

    return NextResponse.json(serialize(salarySplit), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
