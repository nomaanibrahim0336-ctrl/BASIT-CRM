import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { salarySplitUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.salarySplit.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Salary split not found", 404);

    const body = await request.json();
    const parsed = salarySplitUpdateSchema.parse(body);

    const salarySplit = await prisma.salarySplit.update({
      where: { id: params.id },
      data: {
        ...parsed,
        splitType: parsed.splitType as any,
        payPeriod: parsed.payPeriod as any,
        paidStatus: parsed.paidStatus as any,
      },
      include: { teamMember: true, deal: true, adjustments: true },
    });

    return NextResponse.json(serialize(salarySplit));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.salarySplit.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Salary split not found", 404);

    await prisma.salarySplit.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
