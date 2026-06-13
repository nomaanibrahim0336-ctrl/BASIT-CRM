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
import { dealCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.DealWhereInput = {};

    if (teamMember.role === UserRole.SALES_CLOSER) {
      where.assignedCloserId = teamMember.id;
    } else if (teamMember.role === UserRole.DESIGNER) {
      where.assignedDesignerId = teamMember.id;
    } else if (teamMember.role === UserRole.LEAD_GENERATOR) {
      where.lead = { generatedById: teamMember.id };
    } else if (
      teamMember.role !== UserRole.ADMIN &&
      teamMember.role !== UserRole.MERCHANT
    ) {
      throw new ApiError("Forbidden", 403);
    }

    const stage = searchParams.get("stage");
    if (stage) where.dealStage = stage as Prisma.EnumDealStageFilter["equals"];

    const balanceStatus = searchParams.get("balanceStatus");
    if (balanceStatus) where.balanceStatus = balanceStatus as Prisma.EnumBalanceStatusFilter["equals"];

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { dealName: { contains: search, mode: "insensitive" } },
        { discordChannel: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { lead: true, assignedDesigner: true, assignedCloser: true },
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.SALES_CLOSER]);

    const body = await request.json();
    const parsed = dealCreateSchema.parse(body);

    const assignedCloserId =
      teamMember.role === UserRole.SALES_CLOSER
        ? teamMember.id
        : parsed.assignedCloserId;

    const deal = await prisma.deal.create({
      data: {
        dealName: parsed.dealName,
        discordChannel: parsed.discordChannel,
        serviceType: parsed.serviceType as any,
        dealValue: parsed.dealValue,
        upfrontPayment: parsed.upfrontPayment,
        balancePayment: parsed.balancePayment,
        balanceStatus: parsed.balanceStatus as any,
        dealStage: parsed.dealStage as any,
        briefLink: parsed.briefLink,
        deadline: parsed.deadline,
        dateWon: parsed.dateWon,
        dateDelivered: parsed.dateDelivered,
        priority: parsed.priority as any,
        notes: parsed.notes,
        leadId: parsed.leadId,
        assignedDesignerId: parsed.assignedDesignerId,
        assignedCloserId,
      },
      include: { lead: true, assignedDesigner: true, assignedCloser: true },
    });

    return NextResponse.json(serialize(deal), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
