"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateDeal, useUpdateDeal } from "@/hooks/useDeals";
import { useTeamMembers } from "@/hooks/useTeam";
import {
  BALANCE_STATUS_LABELS,
  DEAL_STAGE_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/constants";
import { BalanceStatus, DealStage, Priority, ServiceType, UserRole } from "@/types/enums";
import type { Deal } from "@/types/database";
import { dealCreateSchema, dealUpdateSchema } from "@/lib/validations";
import { z } from "zod";

type DealFormValues = z.infer<typeof dealCreateSchema>;

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  leadId?: string;
}

export function DealForm({ open, onOpenChange, deal, leadId }: DealFormProps) {
  const { toast } = useToast();
  const { data: designers } = useTeamMembers({ role: UserRole.DESIGNER });
  const { data: closers } = useTeamMembers({ role: UserRole.SALES_CLOSER });
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal(deal?.id ?? "");

  const schema = deal ? dealUpdateSchema : dealCreateSchema;

  const defaultValues = (): DealFormValues => ({
    dealName: deal?.dealName ?? "",
    discordChannel: deal?.discordChannel ?? "",
    serviceType: deal?.serviceType ?? ServiceType.OTHER,
    dealValue: deal?.dealValue ?? 0,
    upfrontPayment: deal?.upfrontPayment ?? 0,
    balancePayment: deal?.balancePayment ?? 0,
    balanceStatus: deal?.balanceStatus ?? BalanceStatus.PENDING,
    dealStage: deal?.dealStage ?? DealStage.WON,
    briefLink: deal?.briefLink ?? "",
    priority: deal?.priority ?? Priority.MEDIUM,
    notes: deal?.notes ?? "",
    leadId: deal?.leadId ?? leadId ?? "",
    assignedDesignerId: deal?.assignedDesignerId ?? undefined,
    assignedCloserId: deal?.assignedCloserId ?? undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) reset(defaultValues());
  }, [open, deal]);

  async function onSubmit(values: DealFormValues) {
    try {
      const payload = {
        ...values,
        dealValue: Number(values.dealValue),
        upfrontPayment: Number(values.upfrontPayment),
        balancePayment: Number(values.balancePayment),
      };

      if (deal) {
        await updateDeal.mutateAsync(payload);
        toast({ title: "Deal updated" });
      } else {
        await createDeal.mutateAsync(payload);
        toast({ title: "Deal created" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealName">Deal Name</Label>
              <Input id="dealName" {...register("dealName")} />
              {errors.dealName && (
                <p className="text-sm text-destructive">{errors.dealName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discordChannel">Discord Channel</Label>
              <Input id="discordChannel" {...register("discordChannel")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Controller
                control={control}
                name="serviceType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
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
              <Label>Stage</Label>
              <Controller
                control={control}
                name="dealStage"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEAL_STAGE_LABELS).map(([value, label]) => (
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
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealValue">Deal Value</Label>
              <Input id="dealValue" type="number" step="0.01" {...register("dealValue", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upfrontPayment">Upfront Payment</Label>
              <Input id="upfrontPayment" type="number" step="0.01" {...register("upfrontPayment", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balancePayment">Balance Payment</Label>
              <Input id="balancePayment" type="number" step="0.01" {...register("balancePayment", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Balance Status</Label>
              <Controller
                control={control}
                name="balanceStatus"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BALANCE_STATUS_LABELS).map(([value, label]) => (
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
              <Label>Assigned Designer</Label>
              <Controller
                control={control}
                name="assignedDesignerId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {designers?.data.map((designer) => (
                        <SelectItem key={designer.id} value={designer.id}>
                          {designer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Closer</Label>
              <Controller
                control={control}
                name="assignedCloserId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {closers?.data.map((closer) => (
                        <SelectItem key={closer.id} value={closer.id}>
                          {closer.fullName}
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
              <Label htmlFor="briefLink">Brief Link</Label>
              <Input id="briefLink" {...register("briefLink")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadId">Lead ID</Label>
              <Input id="leadId" {...register("leadId")} disabled={!!deal} />
              {errors.leadId && (
                <p className="text-sm text-destructive">{errors.leadId.message}</p>
              )}
            </div>
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
              {deal ? "Save Changes" : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
