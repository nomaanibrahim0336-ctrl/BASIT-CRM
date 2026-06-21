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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTeamMembers } from "@/hooks/useTeam";
import { dailyLeadCountCreateSchema } from "@/lib/validations";
import { UserRole } from "@/types/enums";
import type { DailyLeadCount } from "@/types/database";

const formSchema = dailyLeadCountCreateSchema.extend({
  teamMemberId: z.string().min(1, "Select a lead generator"),
});

type FormValues = z.infer<typeof formSchema>;

interface DailyLeadCountEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: DailyLeadCount;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLeadCountEntryDialog({
  open,
  onOpenChange,
  entry,
}: DailyLeadCountEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: leadGens } = useTeamMembers({ role: UserRole.LEAD_GENERATOR });

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      entry
        ? apiFetch<DailyLeadCount>(`/api/leads/daily-count/${entry.id}`, {
            method: "PATCH",
            body: JSON.stringify({ logDate: values.logDate, count: values.count }),
          })
        : apiFetch<DailyLeadCount>("/api/leads/daily-count", {
            method: "POST",
            body: JSON.stringify(values),
          }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-lead-counts"] }),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamMemberId: entry?.teamMemberId ?? "",
      logDate: entry?.logDate?.slice(0, 10) ?? today(),
      count: entry?.count ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        teamMemberId: entry?.teamMemberId ?? "",
        logDate: entry?.logDate?.slice(0, 10) ?? today(),
        count: entry?.count ?? 0,
      });
    }
  }, [open, entry, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await save.mutateAsync(values);
      toast({ title: entry ? "Entry updated" : "Entry added" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Lead Count" : "Add Lead Count"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Lead Generator</Label>
            <Controller
              control={control}
              name="teamMemberId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={!!entry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead generator" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadGens?.data.map((member) => (
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logDate">Date</Label>
              <Input id="logDate" type="date" {...register("logDate")} />
              {errors.logDate && (
                <p className="text-sm text-destructive">{errors.logDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Leads</Label>
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
