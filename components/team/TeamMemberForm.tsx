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
import { useCreateTeamMember, useUpdateTeamMember } from "@/hooks/useTeam";
import { MEMBER_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { MemberStatus, UserRole } from "@/types/enums";
import type { Team } from "@/types/database";
import { teamCreateSchema, teamUpdateSchema } from "@/lib/validations";

type TeamFormValues = z.infer<typeof teamCreateSchema>;

interface TeamMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Team;
}

export function TeamMemberForm({ open, onOpenChange, member }: TeamMemberFormProps) {
  const { toast } = useToast();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember(member?.id ?? "");

  const schema = member ? teamUpdateSchema : teamCreateSchema;

  const defaultValues = (): TeamFormValues => ({
    fullName: member?.fullName ?? "",
    discordUsername: member?.discordUsername ?? "",
    email: member?.email ?? "",
    role: member?.role ?? UserRole.LEAD_GENERATOR,
    status: member?.status ?? MemberStatus.ACTIVE,
    fixedSalary: member?.fixedSalary ?? null,
    commissionRate: member?.commissionRate ?? null,
    notes: member?.notes ?? "",
    password: "",
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (open) reset(defaultValues());
  }, [open, member]);

  async function onSubmit(values: TeamFormValues) {
    try {
      const payload = {
        ...values,
        fixedSalary: values.fixedSalary != null ? Number(values.fixedSalary) : null,
        commissionRate: values.commissionRate != null ? Number(values.commissionRate) : null,
        password: values.password || undefined,
      };

      if (member) {
        await updateMember.mutateAsync(payload);
        toast({ title: "Team member updated" });
      } else {
        await createMember.mutateAsync(payload);
        toast({ title: "Team member created" });
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
          <DialogTitle>{member ? "Edit Team Member" : "New Team Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discordUsername">Discord Username</Label>
              <Input id="discordUsername" {...register("discordUsername")} />
              {errors.discordUsername && (
                <p className="text-sm text-destructive">{errors.discordUsername.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
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
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
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
              <Label htmlFor="fixedSalary">Fixed Salary</Label>
              <Input
                id="fixedSalary"
                type="number"
                step="0.01"
                {...register("fixedSalary", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                {...register("commissionRate", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          {!member && (
            <div className="space-y-2">
              <Label htmlFor="password">Login Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank for no login access"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {member ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
