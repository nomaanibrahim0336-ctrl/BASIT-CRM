"use client";

import { useEffect, useState } from "react";
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
import { useCreateSalarySplit, useUpdateSalarySplit } from "@/hooks/useFinances";
import { useTeamMembers } from "@/hooks/useTeam";
import { PAY_PERIOD_LABELS, PAID_STATUS_LABELS, SPLIT_TYPE_LABELS } from "@/lib/constants";
import { formatPKR } from "@/lib/utils";
import { PaidStatus, PayPeriod, SplitType } from "@/types/enums";
import type { SalarySplit } from "@/types/database";
import { salarySplitCreateSchema, salarySplitUpdateSchema } from "@/lib/validations";

type SalarySplitFormValues = z.infer<typeof salarySplitCreateSchema>;

interface SalarySplitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salarySplit?: SalarySplit;
}

export function SalarySplitForm({ open, onOpenChange, salarySplit }: SalarySplitFormProps) {
  const { toast } = useToast();
  const { data: teamMembers } = useTeamMembers();
  const createSplit = useCreateSalarySplit();
  const updateSplit = useUpdateSalarySplit(salarySplit?.id ?? "");
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

  const schema = salarySplit ? salarySplitUpdateSchema : salarySplitCreateSchema;

  const defaultValues = (): SalarySplitFormValues => ({
    splitType: salarySplit?.splitType ?? SplitType.COMMISSION,
    splitAmount: salarySplit?.splitAmount ?? 0,
    splitPercentage: salarySplit?.splitPercentage ?? null,
    payPeriod: salarySplit?.payPeriod ?? PayPeriod.MONTHLY,
    paidStatus: salarySplit?.paidStatus ?? PaidStatus.UNPAID,
    datePaid: salarySplit?.datePaid ?? null,
    notes: salarySplit?.notes ?? "",
    teamMemberId: salarySplit?.teamMemberId ?? "",
    dealId: null,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalarySplitFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues());
      setBonusEnabled(false);
      setBonusAmount(0);
    }
  }, [open, salarySplit]);

  const selectedTeamMemberId = watch("teamMemberId");
  const selectedSplitType = watch("splitType");
  const selectedMember = teamMembers?.data.find((m) => m.id === selectedTeamMemberId);

  // Auto-fill amount/percentage from the team member's hire terms when not editing an existing split.
  useEffect(() => {
    if (salarySplit || !selectedMember) return;
    if (selectedSplitType === SplitType.FIXED_SALARY && selectedMember.fixedSalary != null) {
      setValue("splitAmount", Number(selectedMember.fixedSalary));
    }
    if (selectedSplitType === SplitType.COMMISSION && selectedMember.commissionRate != null) {
      setValue("splitPercentage", Number(selectedMember.commissionRate));
    }
  }, [selectedMember, selectedSplitType, salarySplit, setValue]);

  async function onSubmit(values: SalarySplitFormValues) {
    try {
      const payload = {
        ...values,
        splitAmount: Number(values.splitAmount),
        splitPercentage:
          values.splitPercentage === null || values.splitPercentage === undefined || (values.splitPercentage as any) === ""
            ? null
            : Number(values.splitPercentage),
      };

      if (salarySplit) {
        await updateSplit.mutateAsync(payload);
        toast({ title: "Salary split updated" });
      } else {
        await createSplit.mutateAsync(payload);

        if (bonusEnabled && bonusAmount > 0) {
          await createSplit.mutateAsync({
            ...payload,
            splitType: SplitType.BONUS,
            splitAmount: Number(bonusAmount),
            splitPercentage: null,
          });
        }

        toast({ title: "Salary split created" });
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
          <DialogTitle>{salarySplit ? "Edit Salary Split" : "New Salary Split"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Team Member</Label>
            <Controller
              control={control}
              name="teamMemberId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.data.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teamMemberId && (
              <p className="text-sm text-destructive">{errors.teamMemberId.message}</p>
            )}
            {selectedMember && (
              <p className="text-xs text-muted-foreground">
                {selectedMember.fixedSalary != null && `Fixed Salary: ${formatPKR(Number(selectedMember.fixedSalary))}`}
                {selectedMember.fixedSalary != null && selectedMember.commissionRate != null && " · "}
                {selectedMember.commissionRate != null && `Commission: ${selectedMember.commissionRate}%`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="splitAmount">Amount (PKR)</Label>
              <Input id="splitAmount" type="number" step="0.01" {...register("splitAmount", { valueAsNumber: true })} />
              {errors.splitAmount && <p className="text-sm text-destructive">{errors.splitAmount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="splitPercentage">Percentage (optional)</Label>
              <Input
                id="splitPercentage"
                type="number"
                step="0.01"
                {...register("splitPercentage", {
                  setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Split Type</Label>
              <Controller
                control={control}
                name="splitType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPLIT_TYPE_LABELS).map(([value, label]) => (
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
              <Label>Pay Period</Label>
              <Controller
                control={control}
                name="payPeriod"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAY_PERIOD_LABELS).map(([value, label]) => (
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

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={control}
              name="paidStatus"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? PaidStatus.UNPAID}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAID_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {!salarySplit && (
            <div className="space-y-2 rounded-lg border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  id="bonusEnabled"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={bonusEnabled}
                  onChange={(e) => setBonusEnabled(e.target.checked)}
                />
                <Label htmlFor="bonusEnabled">Also add a bonus for this split</Label>
              </div>
              {bonusEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="bonusAmount">Bonus Amount (PKR)</Label>
                  <Input
                    id="bonusAmount"
                    type="number"
                    step="0.01"
                    value={bonusAmount === 0 ? "" : bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Creates a separate "Bonus" split for the same team member and deal.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {salarySplit ? "Save Changes" : "Add Split"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
