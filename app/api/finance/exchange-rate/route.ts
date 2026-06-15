import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { exchangeRateCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";

export async function GET() {
  try {
    await validateAuth();

    const rate = await prisma.exchangeRate.findFirst({ orderBy: { effectiveDate: "desc" } });

    return NextResponse.json(serialize(rate));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const body = await request.json();
    const parsed = exchangeRateCreateSchema.parse(body);

    const rate = await prisma.exchangeRate.create({
      data: {
        rate: parsed.rate,
        effectiveDate: parsed.effectiveDate ? new Date(parsed.effectiveDate) : new Date(),
        setById: teamMember.id,
      },
    });

    return NextResponse.json(serialize(rate), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
