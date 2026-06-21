"use client";

import { Trash2 } from "lucide-react";
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
  canDelete?: boolean;
}

export function DailyLeadCountTable({
  entries,
  showTeamMember,
  canDelete,
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          {showTeamMember && <TableHead>Lead Gen</TableHead>}
          <TableHead>Leads</TableHead>
          <TableHead>Notes</TableHead>
          {canDelete && <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{new Date(entry.logDate).toLocaleDateString()}</TableCell>
            {showTeamMember && <TableCell>{entry.teamMember?.fullName ?? "—"}</TableCell>}
            <TableCell className="font-medium">{entry.count}</TableCell>
            <TableCell className="text-muted-foreground">{entry.notes ?? "—"}</TableCell>
            {canDelete && (
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
        {entries.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showTeamMember ? (canDelete ? 5 : 4) : canDelete ? 4 : 3}
              className="text-center text-muted-foreground py-6"
            >
              No lead counts logged yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
