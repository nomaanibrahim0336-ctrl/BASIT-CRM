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
import { teamCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await validateAuth();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.TeamWhereInput = {};

    const role = searchParams.get("role");
    if (role) where.role = role as Prisma.EnumUserRoleFilter["equals"];

    const status = searchParams.get("status");
    if (status) where.status = status as Prisma.EnumMemberStatusFilter["equals"];

    const [data, totalCount] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: "asc" },
      }),
      prisma.team.count({ where }),
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
    const parsed = teamCreateSchema.parse(body);

    const created = await prisma.team.create({
      data: {
        ...parsed,
        role: parsed.role as any,
        status: parsed.status as any,
      },
    });

    return NextResponse.json(serialize(created), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
