"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteLead } from "@/hooks/useLeads";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { LeadStatus, UserRole } from "@/types/enums";
import type { Lead } from "@/types/database";

interface LeadsTableProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
}

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [LeadStatus.NEW]: "default",
  [LeadStatus.CONTACTED]: "secondary",
  [LeadStatus.QUALIFIED]: "outline",
  [LeadStatus.NOT_INTERESTED]: "destructive",
};

export function LeadsTable({ leads, onEdit }: LeadsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { teamMember } = useAuth();
  const deleteLead = useDeleteLead();

  function canManage(lead: Lead) {
    if (!teamMember) return false;
    if (teamMember.role === UserRole.ADMIN) return true;
    if (teamMember.role === UserRole.LEAD_GENERATOR) return lead.generatedById === teamMember.id;
    if (teamMember.role === UserRole.SALES_CLOSER) return lead.assignedCloserId === teamMember.id;
    return false;
  }

  async function handleDelete(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation();
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast({ title: "Lead deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Closer</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow
            key={lead.id}
            className="cursor-pointer"
            onClick={() => router.push(`/leads/${lead.id}`)}
          >
            <TableCell className="font-medium">{lead.clientName}</TableCell>
            <TableCell>{lead.companyName ?? "—"}</TableCell>
            <TableCell>{SERVICE_TYPE_LABELS[lead.serviceNeeded]}</TableCell>
            <TableCell>{LEAD_SOURCE_LABELS[lead.leadSource]}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[lead.leadStatus]}>
                {LEAD_STATUS_LABELS[lead.leadStatus]}
              </Badge>
            </TableCell>
            <TableCell>{lead.assignedCloser?.fullName ?? "Unassigned"}</TableCell>
            <TableCell>
              {canManage(lead) && (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(lead);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, lead)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
        {leads.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
              No leads found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
