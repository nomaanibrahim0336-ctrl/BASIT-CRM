"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { useLogDailyLeadCount } from "@/hooks/useLeads";
import { dailyLeadCountCreateSchema } from "@/lib/validations";

type FormValues = z.infer<typeof dailyLeadCountCreateSchema>;

interface DailyLeadCountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLeadCountForm({ open, onOpenChange }: DailyLeadCountFormProps) {
  const { toast } = useToast();
  const logCount = useLogDailyLeadCount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(dailyLeadCountCreateSchema),
    defaultValues: { logDate: today(), count: 0, notes: "" },
  });

  useEffect(() => {
    if (open) reset({ logDate: today(), count: 0, notes: "" });
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await logCount.mutateAsync(values);
      toast({ title: "Lead count logged" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Today&apos;s Leads</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logDate">Date</Label>
            <Input id="logDate" type="date" {...register("logDate")} />
            {errors.logDate && (
              <p className="text-sm text-destructive">{errors.logDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Leads</Label>
            <Input
              id="count"
              type="number"
              min="0"
              step="1"
              {...register("count", { valueAsNumber: true })}
            />
            {errors.count && (
              <p className="text-sm text-destructive">{errors.count.message}</p>
            )}
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
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
