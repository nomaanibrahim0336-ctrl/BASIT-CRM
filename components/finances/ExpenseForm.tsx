"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateExpense, useUpdateExpense } from "@/hooks/useFinances";
import { useTeamMembers } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_TYPE_LABELS } from "@/lib/constants";
import { ExpenseCategory, ExpenseType } from "@/types/enums";
import type { Expense } from "@/types/database";
import { expenseCreateSchema, expenseUpdateSchema } from "@/lib/validations";

type ExpenseFormValues = z.infer<typeof expenseCreateSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const { toast } = useToast();
  const { teamMember } = useAuth();
  const { data: teamMembers } = useTeamMembers();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(expense?.id ?? "");

  const schema = expense ? expenseUpdateSchema : expenseCreateSchema;

  const defaultValues = (): ExpenseFormValues => ({
    category: expense?.category ?? ExpenseCategory.OTHER,
    expenseType: expense?.expenseType ?? ExpenseType.VARIABLE,
    description: expense?.description ?? "",
    amount: expense ? Number(expense.amount) || 0 : 0,
    dateIncurred: expense?.dateIncurred ?? new Date().toISOString(),
    receiptLink: expense?.receiptLink ?? "",
    notes: expense?.notes ?? "",
    paidById: expense?.paidById ?? teamMember?.id ?? null,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) reset(defaultValues());
  }, [open, expense]);

  async function onSubmit(values: ExpenseFormValues) {
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        dateIncurred: new Date(values.dateIncurred).toISOString(),
        paidById: values.paidById ?? teamMember?.id ?? null,
      };

      if (expense) {
        await updateExpense.mutateAsync(payload);
        toast({ title: "Expense updated" });
      } else {
        await createExpense.mutateAsync(payload);
        toast({ title: "Expense logged" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const dateDefaultValue = expense?.dateIncurred
    ? new Date(expense.dateIncurred).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Log Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                control={control}
                name="expenseType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateIncurred">Date</Label>
              <Input
                id="dateIncurred"
                type="date"
                defaultValue={dateDefaultValue}
                {...register("dateIncurred", {
                  setValueAs: (v) => (v ? new Date(v).toISOString() : new Date().toISOString()),
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paid By</Label>
            <Controller
              control={control}
              name="paidById"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? teamMember?.id ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.data.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptLink">Receipt Link (optional)</Label>
            <Input id="receiptLink" placeholder="https://..." {...register("receiptLink")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {expense ? "Save Changes" : "Log Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
