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
import { useCreateLead, useUpdateLead } from "@/hooks/useLeads";
import { useTeamMembers } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { leadCreateSchema, leadUpdateSchema } from "@/lib/validations";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/constants";
import { LeadSource, LeadStatus, ServiceType, UserRole } from "@/types/enums";
import type { Lead } from "@/types/database";
import { z } from "zod";

type LeadFormValues = z.infer<typeof leadCreateSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
}

export function LeadForm({ open, onOpenChange, lead }: LeadFormProps) {
  const { toast } = useToast();
  const { teamMember } = useAuth();
  const { data: closers } = useTeamMembers({ role: UserRole.SALES_CLOSER });
  const createLead = useCreateLead();
  const updateLead = useUpdateLead(lead?.id ?? "");

  const schema = lead ? leadUpdateSchema : leadCreateSchema;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: lead
      ? {
          clientName: lead.clientName,
          companyName: lead.companyName ?? "",
          discordUsername: lead.discordUsername,
          contactInfo: lead.contactInfo ?? "",
          serviceNeeded: lead.serviceNeeded,
          leadSource: lead.leadSource,
          leadStatus: lead.leadStatus,
          notes: lead.notes ?? "",
          assignedCloserId: lead.assignedCloserId ?? undefined,
        }
      : {
          clientName: "",
          companyName: "",
          discordUsername: "",
          contactInfo: "",
          serviceNeeded: ServiceType.OTHER,
          leadSource: LeadSource.OTHER,
          leadStatus: LeadStatus.NEW,
          notes: "",
        },
  });

  useEffect(() => {
    if (open) {
      reset(
        lead
          ? {
              clientName: lead.clientName,
              companyName: lead.companyName ?? "",
              discordUsername: lead.discordUsername,
              contactInfo: lead.contactInfo ?? "",
              serviceNeeded: lead.serviceNeeded,
              leadSource: lead.leadSource,
              leadStatus: lead.leadStatus,
              notes: lead.notes ?? "",
              assignedCloserId: lead.assignedCloserId ?? undefined,
            }
          : {
              clientName: "",
              companyName: "",
              discordUsername: "",
              contactInfo: "",
              serviceNeeded: ServiceType.OTHER,
              leadSource: LeadSource.OTHER,
              leadStatus: LeadStatus.NEW,
              notes: "",
            }
      );
    }
  }, [open, lead, reset]);

  async function onSubmit(values: LeadFormValues) {
    try {
      if (lead) {
        await updateLead.mutateAsync(values);
        toast({ title: "Lead updated" });
      } else {
        await createLead.mutateAsync(values);
        toast({ title: "Lead created" });
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
          <DialogTitle>{lead ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" {...register("clientName")} />
              {errors.clientName && (
                <p className="text-sm text-destructive">{errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...register("companyName")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discordUsername">Discord Username</Label>
              <Input id="discordUsername" {...register("discordUsername")} />
              {errors.discordUsername && (
                <p className="text-sm text-destructive">{errors.discordUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info</Label>
              <Input id="contactInfo" {...register("contactInfo")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Needed</Label>
              <Controller
                control={control}
                name="serviceNeeded"
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
              <Label>Lead Source</Label>
              <Controller
                control={control}
                name="leadSource"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
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
              <Label>Lead Status</Label>
              <Controller
                control={control}
                name="leadStatus"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {(teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.LEAD_GENERATOR) && (
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
            )}
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
              {lead ? "Save Changes" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
