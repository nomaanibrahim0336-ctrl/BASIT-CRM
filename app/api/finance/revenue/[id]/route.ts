import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { revenueLogUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const existing = await prisma.revenueLog.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Revenue log entry not found", 404);

    const body = await request.json();
    const parsed = revenueLogUpdateSchema.parse(body);

    const revenueLog = await prisma.revenueLog.update({
      where: { id: params.id },
      data: {
        ...parsed,
        paymentType: parsed.paymentType as any,
        paymentMethod: parsed.paymentMethod as any,
      },
      include: { deal: true, handledBy: true },
    });

    return NextResponse.json(serialize(revenueLog));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.revenueLog.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Revenue log entry not found", 404);

    await prisma.revenueLog.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
