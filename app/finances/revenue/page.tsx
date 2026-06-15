"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinanceSummaryCards } from "@/components/finances/FinanceSummaryCards";
import { RevenueForm } from "@/components/finances/RevenueForm";
import { useRevenueLogs } from "@/hooks/useFinances";
import { useAuth } from "@/hooks/useAuth";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatUSD } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { UserRole } from "@/types/enums";

export default function RevenuePage() {
  const { teamMember } = useAuth();
  const { data, isLoading } = useRevenueLogs();
  const [formOpen, setFormOpen] = useState(false);

  const canManage = teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.MERCHANT;

  const total = (data?.data ?? []).reduce((sum, r) => sum + r.amountReceived, 0);
  const confirmedTotal = (data?.data ?? [])
    .filter((r) => r.confirmed)
    .reduce((sum, r) => sum + r.amountReceived, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Revenue (USD)</h1>
        {canManage && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Revenue
          </Button>
        )}
      </div>

      <FinanceSummaryCards
        items={[
          { title: "Total Logged", value: total, icon: DollarSign },
          { title: "Confirmed", value: confirmedTotal, icon: DollarSign },
        ]}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Amount (USD)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Handled By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.deal?.dealName ?? "—"}</TableCell>
                <TableCell>{formatUSD(log.amountReceived)}</TableCell>
                <TableCell>{PAYMENT_TYPE_LABELS[log.paymentType]}</TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[log.paymentMethod]}</TableCell>
                <TableCell>{new Date(log.dateReceived).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={log.confirmed ? "default" : "secondary"}>
                    {log.confirmed ? "Confirmed" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>{log.handledBy?.fullName ?? "—"}</TableCell>
              </TableRow>
            ))}
            {(data?.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  No revenue entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <RevenueForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
