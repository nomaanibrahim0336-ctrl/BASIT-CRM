import { NextRequest, NextResponse } from "next/server";
import { handleApiError, serialize, validateAuth, validateRole } from "@/lib/api-utils";
import { calculateMonthlyPnL, calculateCurrentMonthPnL } from "@/lib/finance-calculations";
import { UserRole } from "@/types/enums";

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const body = await request.json().catch(() => ({}));

    const record =
      body?.year && body?.monthIndex !== undefined
        ? await calculateMonthlyPnL(Number(body.year), Number(body.monthIndex))
        : await calculateCurrentMonthPnL();

    return NextResponse.json(serialize(record));
  } catch (error) {
    return handleApiError(error);
  }
}
