"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { LeadStatus } from "@/types/enums";
import type { Lead } from "@/types/database";

interface LeadsTableProps {
  leads: Lead[];
}

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [LeadStatus.NEW]: "default",
  [LeadStatus.CONTACTED]: "secondary",
  [LeadStatus.QUALIFIED]: "outline",
  [LeadStatus.NOT_INTERESTED]: "destructive",
};

export function LeadsTable({ leads }: LeadsTableProps) {
  const router = useRouter();

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
          </TableRow>
        ))}
        {leads.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
              No leads found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
