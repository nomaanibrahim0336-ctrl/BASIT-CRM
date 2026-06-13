import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPaginatedResponse,
  handleApiError,
  parsePagination,
  serialize,
  validateRole,
  validateAuth,
} from "@/lib/api-utils";
import { UserRole } from "@/types/enums";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const year = searchParams.get("year");
    const where = year ? { year: parseInt(year, 10) } : {};

    const [data, totalCount] = await Promise.all([
      prisma.monthlyPnL.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
      prisma.monthlyPnL.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}
