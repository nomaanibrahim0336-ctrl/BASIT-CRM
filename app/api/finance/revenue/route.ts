import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPaginatedResponse,
  handleApiError,
  parsePagination,
  serialize,
  validateAuth,
  validateRole,
} from "@/lib/api-utils";
import { revenueLogCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT, UserRole.SALES_CLOSER]);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.RevenueLogWhereInput = {};

    if (teamMember.role === UserRole.SALES_CLOSER) {
      where.deal = { assignedCloserId: teamMember.id };
    }

    const confirmed = searchParams.get("confirmed");
    if (confirmed !== null) where.confirmed = confirmed === "true";

    const [data, totalCount] = await Promise.all([
      prisma.revenueLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateReceived: "desc" },
        include: { deal: true, handledBy: true },
      }),
      prisma.revenueLog.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const body = await request.json();
    const parsed = revenueLogCreateSchema.parse(body);

    const revenueLog = await prisma.revenueLog.create({
      data: {
        amountReceived: parsed.amountReceived,
        paymentType: parsed.paymentType as any,
        dateReceived: parsed.dateReceived,
        paymentMethod: parsed.paymentMethod as any,
        confirmed: parsed.confirmed,
        notes: parsed.notes,
        dealId: parsed.dealId,
        handledById: parsed.handledById ?? teamMember.id,
      },
      include: { deal: true, handledBy: true },
    });

    return NextResponse.json(serialize(revenueLog), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
