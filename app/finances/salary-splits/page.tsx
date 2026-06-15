"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Wallet, CheckCircle2, Users, Banknote, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinanceSummaryCards } from "@/components/finances/FinanceSummaryCards";
import { SalarySplitForm } from "@/components/finances/SalarySplitForm";
import { AdjustmentsDialog } from "@/components/finances/AdjustmentsDialog";
import { useToast } from "@/hooks/use-toast";
import {
  useDeleteSalarySplit,
  useInitializePayrollMonth,
  useSalarySplits,
  useUpdateSalarySplit,
} from "@/hooks/useFinances";
import { useTeamMembers } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PAID_STATUS_LABELS, PAY_PERIOD_LABELS, SPLIT_TYPE_LABELS } from "@/lib/constants";
import { formatPKR } from "@/lib/utils";
import { MemberStatus, PaidStatus, UserRole } from "@/types/enums";
import type { SalarySplit } from "@/types/database";

function currentPeriodMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function netAmount(split: SalarySplit) {
  const adjustments = split.adjustments ?? [];
  return split.splitAmount + adjustments.reduce((sum, a) => sum + a.amount, 0);
}

export default function SalarySplitsPage() {
  const { teamMember } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: teamMembers } = useTeamMembers();

  const [periodMonth, setPeriodMonth] = useState(currentPeriodMonth());
  const [memberFilter, setMemberFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editingSplit, setEditingSplit] = useState<SalarySplit | undefined>(undefined);
  const [adjustmentsSplit, setAdjustmentsSplit] = useState<SalarySplit | undefined>(undefined);

  const isAdmin = teamMember?.role === UserRole.ADMIN;

  const filters: Record<string, string> = { periodMonth };
  if (statusFilter !== "all") filters.paidStatus = statusFilter;

  const { data, isLoading } = useSalarySplits(filters);
  const deleteSplit = useDeleteSalarySplit();
  const initializeMonth = useInitializePayrollMonth();

  const splits = useMemo(() => {
    let rows = data?.data ?? [];
    if (memberFilter !== "all") rows = rows.filter((s) => s.teamMemberId === memberFilter);
    return rows;
  }, [data, memberFilter]);

  const activeStaffCount = (teamMembers?.data ?? []).filter((m) => m.status === MemberStatus.ACTIVE).length;
  const totalPayroll = splits.reduce((sum, s) => sum + netAmount(s), 0);
  const totalPaid = splits.filter((s) => s.paidStatus === PaidStatus.PAID).reduce((sum, s) => sum + netAmount(s), 0);
  const totalUnpaid = splits.filter((s) => s.paidStatus === PaidStatus.UNPAID).reduce((sum, s) => sum + netAmount(s), 0);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(selected.size === splits.length ? new Set() : new Set(splits.map((s) => s.id)));
  }

  async function handleDelete(split: SalarySplit) {
    if (!confirm("Delete this salary split? This cannot be undone.")) return;
    try {
      await deleteSplit.mutateAsync(split.id);
      toast({ title: "Salary split deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function handleBulkMark(status: PaidStatus) {
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          apiFetch(`/api/finance/salary-splits/${id}`, {
            method: "PATCH",
            body: JSON.stringify({
              paidStatus: status,
              datePaid: status === PaidStatus.PAID ? new Date().toISOString() : null,
            }),
          })
        )
      );
      toast({ title: `${selected.size} salary split(s) marked as ${PAID_STATUS_LABELS[status]}` });
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["salary-splits"] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function handleInitializeMonth() {
    try {
      const result = await initializeMonth.mutateAsync(periodMonth);
      toast({ title: `Initialized payroll for ${periodMonth}`, description: `${result.created} entries created` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  function openCreate() {
    setEditingSplit(undefined);
    setFormOpen(true);
  }

  function openEdit(split: SalarySplit) {
    setEditingSplit(split);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Salary Splits (PKR)</h1>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={periodMonth}
            onChange={(e) => setPeriodMonth(e.target.value)}
            className="w-[160px]"
          />
          {isAdmin && (
            <Button variant="outline" onClick={handleInitializeMonth} disabled={initializeMonth.isPending}>
              Initialize Month
            </Button>
          )}
          {isAdmin && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Split
            </Button>
          )}
        </div>
      </div>

      <FinanceSummaryCards
        items={[
          { title: "Total Staff", value: activeStaffCount, icon: Users, format: (v) => String(v) },
          { title: "Total Payroll", value: totalPayroll, icon: Banknote, format: formatPKR },
          { title: "Total Paid", value: totalPaid, icon: CheckCircle2, format: formatPKR },
          { title: "Total Unpaid", value: totalUnpaid, icon: Wallet, format: formatPKR },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Select value={memberFilter} onValueChange={setMemberFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Team Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {teamMembers?.data.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(PAID_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isAdmin && selected.size > 0 && (
          <>
            <Button variant="outline" onClick={() => handleBulkMark(PaidStatus.PAID)}>
              Mark {selected.size} as Paid
            </Button>
            <Button variant="outline" onClick={() => handleBulkMark(PaidStatus.UNPAID)}>
              Mark {selected.size} as Unpaid
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={splits.length > 0 && selected.size === splits.length}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Team Member</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount (PKR)</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {splits.map((split) => (
              <SplitRow
                key={split.id}
                split={split}
                isAdmin={isAdmin}
                selected={selected.has(split.id)}
                onToggleSelect={() => toggleSelect(split.id)}
                onEdit={() => openEdit(split)}
                onDelete={() => handleDelete(split)}
                onAdjust={() => setAdjustmentsSplit(split)}
              />
            ))}
            {splits.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 6} className="text-center text-muted-foreground py-6">
                  No salary splits found for {periodMonth}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <SalarySplitForm open={formOpen} onOpenChange={setFormOpen} salarySplit={editingSplit} periodMonth={periodMonth} />
      {adjustmentsSplit && (
        <AdjustmentsDialog
          open={!!adjustmentsSplit}
          onOpenChange={(open) => !open && setAdjustmentsSplit(undefined)}
          split={adjustmentsSplit}
        />
      )}
    </div>
  );
}

function SplitRow({
  split,
  isAdmin,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onAdjust,
}: {
  split: SalarySplit;
  isAdmin: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdjust: () => void;
}) {
  const { toast } = useToast();
  const updateSplit = useUpdateSalarySplit(split.id);
  const hasAdjustments = (split.adjustments ?? []).length > 0;

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
      {isAdmin && (
        <TableCell>
          <input type="checkbox" className="h-4 w-4" checked={selected} onChange={onToggleSelect} />
        </TableCell>
      )}
      <TableCell className="font-medium">{split.teamMember?.fullName ?? "—"}</TableCell>
      <TableCell>{split.deal?.dealName ?? "—"}</TableCell>
      <TableCell>{SPLIT_TYPE_LABELS[split.splitType as keyof typeof SPLIT_TYPE_LABELS]}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span>{formatPKR(netAmount(split))}</span>
          {hasAdjustments && (
            <span title="Adjustments applied" className="text-amber-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{PAY_PERIOD_LABELS[split.payPeriod as keyof typeof PAY_PERIOD_LABELS]}</TableCell>
      <TableCell>
        <Badge
          variant={split.paidStatus === PaidStatus.PAID ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={togglePaid}
        >
          {PAID_STATUS_LABELS[split.paidStatus as keyof typeof PAID_STATUS_LABELS]}
        </Badge>
      </TableCell>
      {isAdmin && (
        <TableCell>
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={onAdjust} title="Additions / Deductions">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
