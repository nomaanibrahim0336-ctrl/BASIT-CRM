import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { UserRole } from "@/types/enums";
import { z } from "zod";

const incrementSchema = z.object({
  delta: z.number().int().refine((n) => n !== 0),
});

function today() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.LEAD_GENERATOR]);

    const body = await request.json();
    const { delta } = incrementSchema.parse(body);

    const logDate = today();

    const existing = await prisma.dailyLeadCount.findUnique({
      where: { teamMemberId_logDate: { teamMemberId: teamMember.id, logDate } },
    });

    const nextCount = Math.max(0, (existing?.count ?? 0) + delta);

    const entry = await prisma.dailyLeadCount.upsert({
      where: { teamMemberId_logDate: { teamMemberId: teamMember.id, logDate } },
      create: { teamMemberId: teamMember.id, logDate, count: nextCount },
      update: { count: nextCount },
      include: { teamMember: true },
    });

    return NextResponse.json(serialize(entry));
  } catch (error) {
    return handleApiError(error);
  }
}
