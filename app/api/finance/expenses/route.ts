import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPaginatedResponse,
  handleApiError,
  parsePagination,
  serialize,
  validateAuth,
  validateRole,
} from "@/lib/api-utils";
import { expenseCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.ExpenseWhereInput = {};

    const category = searchParams.get("category");
    if (category) where.category = category as Prisma.EnumExpenseCategoryFilter["equals"];

    const expenseType = searchParams.get("expenseType");
    if (expenseType) where.expenseType = expenseType as Prisma.EnumExpenseTypeFilter["equals"];

    const [data, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateIncurred: "desc" },
        include: { paidBy: true },
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json(serialize(buildPaginatedResponse(data, totalCount, page, limit)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = await validateAuth();
    validateRole(teamMember, [UserRole.ADMIN, UserRole.MERCHANT]);

    const body = await request.json();
    const parsed = expenseCreateSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        category: parsed.category as any,
        expenseType: parsed.expenseType as any,
        description: parsed.description,
        amount: parsed.amount,
        dateIncurred: parsed.dateIncurred,
        receiptLink: parsed.receiptLink,
        notes: parsed.notes,
        paidById: parsed.paidById ?? teamMember.id,
      },
      include: { paidBy: true },
    });

    return NextResponse.json(serialize(expense), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
