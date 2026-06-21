"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteDailyLeadCount } from "@/hooks/useLeads";
import type { DailyLeadCount } from "@/types/database";

interface DailyLeadCountTableProps {
  entries: DailyLeadCount[];
  showTeamMember?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (entry: DailyLeadCount) => void;
}

export function DailyLeadCountTable({
  entries,
  showTeamMember,
  canEdit,
  canDelete,
  onEdit,
}: DailyLeadCountTableProps) {
  const { toast } = useToast();
  const deleteEntry = useDeleteDailyLeadCount();

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead count entry?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast({ title: "Entry deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  const showActions = canEdit || canDelete;
  const colSpan = (showTeamMember ? 1 : 0) + (showActions ? 1 : 0) + 2;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          {showTeamMember && <TableHead>Lead Gen</TableHead>}
          <TableHead>Leads</TableHead>
          {showActions && <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{new Date(entry.logDate).toLocaleDateString()}</TableCell>
            {showTeamMember && <TableCell>{entry.teamMember?.fullName ?? "—"}</TableCell>}
            <TableCell className="font-medium">{entry.count}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex justify-end gap-1">
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit?.(entry)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {entries.length === 0 && (
          <TableRow>
            <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-6">
              No lead counts logged yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
