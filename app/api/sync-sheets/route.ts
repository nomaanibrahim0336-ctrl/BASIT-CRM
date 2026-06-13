import { NextResponse } from "next/server";
import { handleApiError, validateAuth, validateRole } from "@/lib/api-utils";
import { syncToGoogleSheets } from "@/lib/google-sheets";
import { UserRole } from "@/types/enums";

export async function POST() {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN]);

    const result = await syncToGoogleSheets();

    return NextResponse.json({ success: true, synced: result });
  } catch (error) {
    return handleApiError(error);
  }
}
