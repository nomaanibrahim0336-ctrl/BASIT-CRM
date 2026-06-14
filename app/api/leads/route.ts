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
import { leadCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.LeadWhereInput = {};

    if (teamMember.role === UserRole.LEAD_GENERATOR) {
      where.generatedById = teamMember.id;
    } else if (teamMember.role === UserRole.SALES_CLOSER) {
      where.assignedCloserId = teamMember.id;
    } else if (teamMember.role !== UserRole.ADMIN) {
      throw new ApiError("Forbidden", 403);
    }

    const status = searchParams.get("status");
    if (status) where.leadStatus = status as Prisma.EnumLeadStatusFilter["equals"];

    const source = searchParams.get("source");
    if (source) where.leadSource = source as Prisma.EnumLeadSourceFilter["equals"];

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { discordUsername: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { assignedCloser: true, generatedBy: true },
      }),
      prisma.lead.count({ where }),
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
    const parsed = leadCreateSchema.parse(body);

    // Lead generators always own their own leads. Admins may attribute the
    // lead to a specific generator, otherwise it defaults to the admin.
    const generatedById =
      teamMember.role === UserRole.LEAD_GENERATOR
        ? teamMember.id
        : parsed.generatedById ?? teamMember.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: parsed.clientName,
        companyName: parsed.companyName,
        discordUsername: parsed.discordUsername,
        contactInfo: parsed.contactInfo,
        serviceNeeded: parsed.serviceNeeded as any,
        leadSource: parsed.leadSource as any,
        leadStatus: parsed.leadStatus as any,
        notes: parsed.notes,
        assignedCloserId: parsed.assignedCloserId,
        generatedById,
      },
      include: { assignedCloser: true, generatedBy: true },
    });

    return NextResponse.json(serialize(lead), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
