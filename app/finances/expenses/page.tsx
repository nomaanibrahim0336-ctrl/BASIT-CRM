"use client";

import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinanceSummaryCards } from "@/components/finances/FinanceSummaryCards";
import { ExpenseForm } from "@/components/finances/ExpenseForm";
import { useExpenses } from "@/hooks/useFinances";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { formatPKR } from "@/lib/utils";
import { ExpenseType } from "@/types/enums";

export default function ExpensesPage() {
  const { data, isLoading } = useExpenses();
  const [formOpen, setFormOpen] = useState(false);

  const total = (data?.data ?? []).reduce((sum, e) => sum + e.amount, 0);
  const fixedTotal = (data?.data ?? [])
    .filter((e) => e.expenseType === ExpenseType.FIXED)
    .reduce((sum, e) => sum + e.amount, 0);
  const variableTotal = (data?.data ?? [])
    .filter((e) => e.expenseType === ExpenseType.VARIABLE)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses (PKR)</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Expense
        </Button>
      </div>

      <FinanceSummaryCards
        items={[
          { title: "Total Expenses", value: total, icon: Receipt, format: formatPKR },
          { title: "Fixed", value: fixedTotal, icon: Receipt, format: formatPKR },
          { title: "Variable", value: variableTotal, icon: Receipt, format: formatPKR },
        ]}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount (PKR)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Paid By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{EXPENSE_CATEGORY_LABELS[expense.category]}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{EXPENSE_TYPE_LABELS[expense.expenseType]}</Badge>
                </TableCell>
                <TableCell>{formatPKR(expense.amount)}</TableCell>
                <TableCell>{new Date(expense.dateIncurred).toLocaleDateString()}</TableCell>
                <TableCell>{expense.paidBy?.fullName ?? "—"}</TableCell>
              </TableRow>
            ))}
            {(data?.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <ExpenseForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
