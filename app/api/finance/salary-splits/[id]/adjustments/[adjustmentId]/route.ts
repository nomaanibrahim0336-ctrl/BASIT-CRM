import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, validateAuth, validateRole } from "@/lib/api-utils";
import { UserRole } from "@/types/enums";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; adjustmentId: string } }
) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.payrollAdjustment.findUnique({ where: { id: params.adjustmentId } });
    if (!existing || existing.salarySplitId !== params.id) throw new ApiError("Adjustment not found", 404);

    await prisma.payrollAdjustment.delete({ where: { id: params.adjustmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
