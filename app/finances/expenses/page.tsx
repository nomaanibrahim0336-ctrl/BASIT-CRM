"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Receipt, Trash2, TrendingDown, Repeat2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { useDeleteExpense, useExpenses } from "@/hooks/useFinances";
import { useAuth } from "@/hooks/useAuth";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { formatPKR } from "@/lib/utils";
import { ExpenseCategory, ExpenseType, UserRole } from "@/types/enums";
import type { Expense } from "@/types/database";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function ExpensesPage() {
  const { teamMember } = useAuth();
  const { toast } = useToast();

  const [monthFilter, setMonthFilter] = useState(currentMonth());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const isAdmin = teamMember?.role === UserRole.ADMIN;

  // Build API filters — month → dateIncurred range sent as query params
  const apiFilters: Record<string, string> = {};
  if (categoryFilter !== "all") apiFilters.category = categoryFilter;
  if (typeFilter !== "all") apiFilters.expenseType = typeFilter;
  if (monthFilter) {
    apiFilters.dateFrom = `${monthFilter}-01`;
    const [y, m] = monthFilter.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    apiFilters.dateTo = nextMonth;
  }

  const { data, isLoading } = useExpenses(apiFilters);
  const deleteExpense = useDeleteExpense();

  const expenses = useMemo(() => {
    let rows = data?.data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          EXPENSE_CATEGORY_LABELS[e.category].toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, search]);

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const fixedTotal = expenses
    .filter((e) => e.expenseType === ExpenseType.FIXED)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const variableTotal = expenses
    .filter((e) => e.expenseType === ExpenseType.VARIABLE)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  async function handleDelete(expense: Expense) {
    if (!confirm("Delete this expense? This cannot be undone.")) return;
    try {
      await deleteExpense.mutateAsync(expense.id);
      toast({ title: "Expense deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  function openCreate() {
    setEditingExpense(undefined);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Expenses (PKR)</h1>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-[160px]"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Log Expense
          </Button>
        </div>
      </div>

      <FinanceSummaryCards
        items={[
          { title: "Total Expenses", value: total, icon: Receipt, format: formatPKR },
          { title: "Fixed", value: fixedTotal, icon: Repeat2, format: formatPKR },
          { title: "Variable", value: variableTotal, icon: TrendingDown, format: formatPKR },
          { title: "Entries", value: expenses.length, icon: LayoutGrid, format: (v) => String(v) },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[220px]"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              {isAdmin && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{EXPENSE_CATEGORY_LABELS[expense.category]}</TableCell>
                <TableCell>
                  <Badge variant={expense.expenseType === ExpenseType.FIXED ? "default" : "secondary"}>
                    {EXPENSE_TYPE_LABELS[expense.expenseType]}
                  </Badge>
                </TableCell>
                <TableCell>{formatPKR(Number(expense.amount))}</TableCell>
                <TableCell>{new Date(expense.dateIncurred).toLocaleDateString()}</TableCell>
                <TableCell>{expense.paidBy?.fullName ?? "—"}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(expense)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground py-6">
                  No expenses found{monthFilter ? ` for ${monthFilter}` : ""}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
      />
    </div>
  );
}
