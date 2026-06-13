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
import { useCreateRevenueLog, useUpdateRevenueLog } from "@/hooks/useFinances";
import { useDeals } from "@/hooks/useDeals";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/constants";
import { PaymentMethod, PaymentType } from "@/types/enums";
import type { RevenueLog } from "@/types/database";
import { revenueLogCreateSchema, revenueLogUpdateSchema } from "@/lib/validations";

type RevenueFormValues = z.infer<typeof revenueLogCreateSchema>;

interface RevenueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueLog?: RevenueLog;
}

export function RevenueForm({ open, onOpenChange, revenueLog }: RevenueFormProps) {
  const { toast } = useToast();
  const { data: deals } = useDeals({ limit: "100" });
  const createRevenue = useCreateRevenueLog();
  const updateRevenue = useUpdateRevenueLog(revenueLog?.id ?? "");

  const schema = revenueLog ? revenueLogUpdateSchema : revenueLogCreateSchema;

  const defaultValues = (): RevenueFormValues => ({
    amountReceived: revenueLog?.amountReceived ?? 0,
    paymentType: revenueLog?.paymentType ?? PaymentType.UPFRONT,
    dateReceived: revenueLog?.dateReceived ?? new Date().toISOString(),
    paymentMethod: revenueLog?.paymentMethod ?? PaymentMethod.BANK_TRANSFER,
    confirmed: revenueLog?.confirmed ?? false,
    notes: revenueLog?.notes ?? "",
    dealId: revenueLog?.dealId ?? "",
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RevenueFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) reset(defaultValues());
  }, [open, revenueLog]);

  async function onSubmit(values: RevenueFormValues) {
    try {
      const payload = {
        ...values,
        amountReceived: Number(values.amountReceived),
        dateReceived: new Date(values.dateReceived).toISOString(),
      };

      if (revenueLog) {
        await updateRevenue.mutateAsync(payload);
        toast({ title: "Revenue entry updated" });
      } else {
        await createRevenue.mutateAsync(payload);
        toast({ title: "Revenue entry created" });
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
          <DialogTitle>{revenueLog ? "Edit Revenue Entry" : "New Revenue Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Deal</Label>
            <Controller
              control={control}
              name="dealId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={!!revenueLog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals?.data.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.dealName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dealId && <p className="text-sm text-destructive">{errors.dealId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input id="amountReceived" type="number" step="0.01" {...register("amountReceived", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateReceived">Date Received</Label>
              <Input
                id="dateReceived"
                type="date"
                {...register("dateReceived", {
                  setValueAs: (v) => (v ? new Date(v).toISOString() : v),
                })}
                defaultValue={defaultValues().dateReceived?.slice(0, 10)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Controller
                control={control}
                name="paymentType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
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
              <Label>Payment Method</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
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

          <div className="flex items-center gap-2">
            <input id="confirmed" type="checkbox" {...register("confirmed")} className="h-4 w-4" />
            <Label htmlFor="confirmed">Confirmed</Label>
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
              {revenueLog ? "Save Changes" : "Add Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
