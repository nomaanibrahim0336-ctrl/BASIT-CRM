import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  handleApiError,
  serialize,
  validateAuth,
  validateRole,
} from "@/lib/api-utils";
import { leadUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

function assertAccess(
  teamMember: { id: string; role: string },
  lead: { generatedById: string; assignedCloserId: string | null }
) {
  if (teamMember.role === UserRole.ADMIN) return;
  if (teamMember.role === UserRole.LEAD_GENERATOR && lead.generatedById === teamMember.id) return;
  if (teamMember.role === UserRole.SALES_CLOSER && lead.assignedCloserId === teamMember.id) return;
  throw new ApiError("Forbidden", 403);
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { assignedCloser: true, generatedBy: true, deals: true },
    });

    if (!lead) throw new ApiError("Lead not found", 404);

    assertAccess(teamMember, lead);

    return NextResponse.json(serialize(lead));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();

    const existing = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Lead not found", 404);

    assertAccess(teamMember, existing);

    const body = await request.json();
    const parsed = leadUpdateSchema.parse(body);

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...parsed,
        serviceNeeded: parsed.serviceNeeded as any,
        leadSource: parsed.leadSource as any,
        leadStatus: parsed.leadStatus as any,
      },
      include: { assignedCloser: true, generatedBy: true },
    });

    return NextResponse.json(serialize(lead));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Lead not found", 404);

    await prisma.lead.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
