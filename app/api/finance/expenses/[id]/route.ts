import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { expenseUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Expense not found", 404);

    const body = await request.json();
    const parsed = expenseUpdateSchema.parse(body);

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...parsed,
        category: parsed.category as any,
        expenseType: parsed.expenseType as any,
      },
      include: { paidBy: true },
    });

    return NextResponse.json(serialize(expense));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Expense not found", 404);

    await prisma.expense.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
