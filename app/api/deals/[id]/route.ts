import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  serialize,
  validateAuth,
  validateRole,
} from "@/lib/api-utils";
import { dealUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

function assertAccess(
  teamMember: { id: string; role: string },
  deal: { assignedCloserId: string | null; assignedDesignerId: string | null }
) {
  if (teamMember.role === UserRole.ADMIN || teamMember.role === UserRole.MERCHANT) return;
  if (teamMember.role === UserRole.SALES_CLOSER && deal.assignedCloserId === teamMember.id) return;
  if (teamMember.role === UserRole.DESIGNER && deal.assignedDesignerId === teamMember.id) return;
  throw new ApiError("Forbidden", 403);
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        lead: true,
        assignedDesigner: true,
        assignedCloser: true,
        salarySplits: true,
        revenueLogs: true,
      },
    });

    if (!deal) throw new ApiError("Deal not found", 404);

    assertAccess(teamMember, deal);

    return NextResponse.json(serialize(deal));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();

    const existing = await prisma.deal.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Deal not found", 404);

    assertAccess(teamMember, existing);

    const body = await request.json();
    const parsed = dealUpdateSchema.parse(body);

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        ...parsed,
        serviceType: parsed.serviceType as any,
        balanceStatus: parsed.balanceStatus as any,
        dealStage: parsed.dealStage as any,
        priority: parsed.priority as any,
      },
      include: { lead: true, assignedDesigner: true, assignedCloser: true },
    });

    return NextResponse.json(serialize(deal));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.deal.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Deal not found", 404);

    await prisma.deal.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
