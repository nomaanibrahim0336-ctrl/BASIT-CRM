import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Resolves the currently authenticated Supabase user to their `teams` record.
export async function validateAuth() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    throw new ApiError("Unauthorized", 401);
  }

  const teamMember = await prisma.team.findUnique({
    where: { authUserId: data.session.user.id },
  });

  if (!teamMember) {
    throw new ApiError("No team member record found for this user", 403);
  }

  return teamMember;
}

// Throws if the given team member's role is not in the allowed list.
export function validateRole(
  teamMember: { role: string },
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(teamMember.role)) {
    throw new ApiError("Forbidden", 403);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, status: error.status },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error: "Internal server error",
      status: 500,
    },
    { status: 500 }
  );
}

// Parses `page` and `limit` query params into Prisma-friendly pagination values.
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );

  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number
) {
  return {
    data,
    totalCount,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

// Recursively converts Prisma Decimal fields to plain numbers so the JSON
// response matches the camelCase `number` types in types/database.ts.
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      value && typeof value === "object" && typeof value.toNumber === "function"
        ? value.toNumber()
        : value
    )
  );
}
