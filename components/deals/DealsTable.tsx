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
import { DEAL_STAGE_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types/database";

interface DealsTableProps {
  deals: Deal[];
}

export function DealsTable({ deals }: DealsTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Deal</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Designer</TableHead>
          <TableHead>Closer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id} className="cursor-pointer" onClick={() => router.push(`/deals/${deal.id}`)}>
            <TableCell className="font-medium">{deal.dealName}</TableCell>
            <TableCell>{SERVICE_TYPE_LABELS[deal.serviceType]}</TableCell>
            <TableCell>{formatCurrency(deal.dealValue)}</TableCell>
            <TableCell>
              <Badge>{DEAL_STAGE_LABELS[deal.dealStage]}</Badge>
            </TableCell>
            <TableCell>{deal.assignedDesigner?.fullName ?? "—"}</TableCell>
            <TableCell>{deal.assignedCloser?.fullName ?? "—"}</TableCell>
          </TableRow>
        ))}
        {deals.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
              No deals found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
