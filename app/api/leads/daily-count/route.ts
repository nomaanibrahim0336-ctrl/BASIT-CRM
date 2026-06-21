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
import { dailyLeadCountCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.DailyLeadCountWhereInput = {};

    if (teamMember.role === UserRole.LEAD_GENERATOR) {
      where.teamMemberId = teamMember.id;
    } else if (teamMember.role !== UserRole.ADMIN) {
      throw new ApiError("Forbidden", 403);
    }

    const teamMemberId = searchParams.get("teamMemberId");
    if (teamMemberId && teamMember.role === UserRole.ADMIN) where.teamMemberId = teamMemberId;

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      where.logDate = {};
      if (dateFrom) where.logDate.gte = new Date(dateFrom);
      if (dateTo) where.logDate.lt = new Date(dateTo);
    }

    const [data, totalCount] = await Promise.all([
      prisma.dailyLeadCount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { logDate: "desc" },
        include: { teamMember: true },
      }),
      prisma.dailyLeadCount.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.LEAD_GENERATOR]);

    const body = await request.json();
    const parsed = dailyLeadCountCreateSchema.parse(body);

    const teamMemberId =
      teamMember.role === UserRole.LEAD_GENERATOR
        ? teamMember.id
        : parsed.teamMemberId ?? teamMember.id;

    const entry = await prisma.dailyLeadCount.upsert({
      where: { teamMemberId_logDate: { teamMemberId, logDate: new Date(parsed.logDate) } },
      create: {
        teamMemberId,
        logDate: new Date(parsed.logDate),
        count: parsed.count,
        notes: parsed.notes,
      },
      update: {
        count: parsed.count,
        notes: parsed.notes,
      },
      include: { teamMember: true },
    });

    return NextResponse.json(serialize(entry), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
