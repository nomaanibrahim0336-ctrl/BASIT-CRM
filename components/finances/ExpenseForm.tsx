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
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(expense?.id ?? "");

  const schema = expense ? expenseUpdateSchema : expenseCreateSchema;

  const defaultValues = (): ExpenseFormValues => ({
    category: expense?.category ?? ExpenseCategory.OTHER,
    expenseType: expense?.expenseType ?? ExpenseType.VARIABLE,
    description: expense?.description ?? "",
    amount: expense?.amount ?? 0,
    dateIncurred: expense?.dateIncurred ?? new Date().toISOString(),
    receiptLink: expense?.receiptLink ?? "",
    notes: expense?.notes ?? "",
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
      };

      if (expense) {
        await updateExpense.mutateAsync(payload);
        toast({ title: "Expense updated" });
      } else {
        await createExpense.mutateAsync(payload);
        toast({ title: "Expense created" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "New Expense"}</DialogTitle>
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
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateIncurred">Date Incurred</Label>
              <Input
                id="dateIncurred"
                type="date"
                {...register("dateIncurred", {
                  setValueAs: (v) => (v ? new Date(v).toISOString() : v),
                })}
                defaultValue={defaultValues().dateIncurred?.slice(0, 10)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptLink">Receipt Link</Label>
            <Input id="receiptLink" {...register("receiptLink")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {expense ? "Save Changes" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
