import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { payrollAdjustmentCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.salarySplit.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Salary split not found", 404);

    const body = await request.json();
    const parsed = payrollAdjustmentCreateSchema.parse(body);

    const adjustment = await prisma.payrollAdjustment.create({
      data: {
        salarySplitId: params.id,
        label: parsed.label,
        amount: parsed.amount,
      },
    });

    return NextResponse.json(serialize(adjustment), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
