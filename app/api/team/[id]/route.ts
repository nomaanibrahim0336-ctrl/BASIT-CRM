import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { teamUpdateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAuth();

    const member = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        generatedLeads: true,
        assignedLeads: true,
        dealsAsDesigner: true,
        dealsAsCloser: true,
        salarySplits: true,
        expenses: true,
        revenueHandled: true,
      },
    });

    if (!member) throw new ApiError("Team member not found", 404);

    return NextResponse.json(serialize(member));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();

    if (teamMember.role !== UserRole.ADMIN && teamMember.id !== params.id) {
      throw new ApiError("Forbidden", 403);
    }

    const existing = await prisma.team.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Team member not found", 404);

    const body = await request.json();
    let parsed = teamUpdateSchema.parse(body);

    // Non-admins may only update their own notes.
    if (teamMember.role !== UserRole.ADMIN) {
      parsed = { notes: parsed.notes };
    }

    const updated = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...parsed,
        role: parsed.role as any,
        status: parsed.status as any,
      },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const existing = await prisma.team.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError("Team member not found", 404);

    await prisma.team.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
