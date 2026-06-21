import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth } from "@/lib/api-utils";
import { dailyLeadCountUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamMember = await validateAuth();
    const existing = await prisma.dailyLeadCount.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Not found", 404);
    if (
      teamMember.role !== UserRole.ADMIN &&
      teamMember.role !== UserRole.SALES_CLOSER &&
      existing.teamMemberId !== teamMember.id
    ) {
      throw new ApiError("Forbidden", 403);
    }

    const body = await request.json();
    const parsed = dailyLeadCountUpdateSchema.parse(body);

    const entry = await prisma.dailyLeadCount.update({
      where: { id: params.id },
      data: {
        ...(parsed.logDate ? { logDate: new Date(parsed.logDate) } : {}),
        ...(parsed.count !== undefined ? { count: parsed.count } : {}),
        ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
      },
      include: { teamMember: true },
    });

    return NextResponse.json(serialize(entry));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamMember = await validateAuth();
    const existing = await prisma.dailyLeadCount.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Not found", 404);
    if (teamMember.role !== UserRole.ADMIN && existing.teamMemberId !== teamMember.id) {
      throw new ApiError("Forbidden", 403);
    }

    await prisma.dailyLeadCount.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
