import { NextRequest, NextResponse } from "next/server";
import { calculateCurrentMonthPnL } from "@/lib/finance-calculations";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await calculateCurrentMonthPnL();

  return NextResponse.json({ success: true, record: { month: record.month, year: record.year } });
}
