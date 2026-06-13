"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSalarySplits, useUpdateSalarySplit } from "@/hooks/useFinances";
import { useAuth } from "@/hooks/useAuth";
import { PAID_STATUS_LABELS, PAY_PERIOD_LABELS, SPLIT_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { PaidStatus, UserRole } from "@/types/enums";

export default function SalarySplitsPage() {
  const { teamMember } = useAuth();
  const { data, isLoading } = useSalarySplits();
  const { toast } = useToast();

  const isAdmin = teamMember?.role === UserRole.ADMIN;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Salary Splits</h1>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((split) => (
              <SplitRow key={split.id} split={split} isAdmin={isAdmin} />
            ))}
            {(data?.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground py-6">
                  No salary splits found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function SplitRow({ split, isAdmin }: { split: any; isAdmin: boolean }) {
  const { toast } = useToast();
  const updateSplit = useUpdateSalarySplit(split.id);

  async function togglePaid() {
    try {
      const next = split.paidStatus === PaidStatus.PAID ? PaidStatus.UNPAID : PaidStatus.PAID;
      await updateSplit.mutateAsync({
        paidStatus: next,
        datePaid: next === PaidStatus.PAID ? new Date().toISOString() : null,
      });
      toast({ title: "Salary split updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{split.teamMember?.fullName ?? "—"}</TableCell>
      <TableCell>{split.deal?.dealName ?? "—"}</TableCell>
      <TableCell>{SPLIT_TYPE_LABELS[split.splitType as keyof typeof SPLIT_TYPE_LABELS]}</TableCell>
      <TableCell>{formatCurrency(split.splitAmount)}</TableCell>
      <TableCell>{PAY_PERIOD_LABELS[split.payPeriod as keyof typeof PAY_PERIOD_LABELS]}</TableCell>
      <TableCell>
        <Badge variant={split.paidStatus === PaidStatus.PAID ? "default" : "secondary"}>
          {PAID_STATUS_LABELS[split.paidStatus as keyof typeof PAID_STATUS_LABELS]}
        </Badge>
      </TableCell>
      {isAdmin && (
        <TableCell>
          <Button variant="outline" size="sm" onClick={togglePaid}>
            Mark as {split.paidStatus === PaidStatus.PAID ? "Unpaid" : "Paid"}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}
