"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { useTeamMembers } from "@/hooks/useTeam";
import { useSyncSheets } from "@/hooks/useFinances";
import { useToast } from "@/hooks/use-toast";
import { MEMBER_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { MemberStatus } from "@/types/enums";

export default function TeamPage() {
  const router = useRouter();
  const { data, isLoading } = useTeamMembers();
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();
  const syncSheets = useSyncSheets();

  async function handleSync() {
    try {
      await syncSheets.mutateAsync();
      toast({ title: "Synced to Google Sheets" });
    } catch (error: any) {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Team</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync} disabled={syncSheets.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync to Sheets
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Discord</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fixed Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((member) => (
              <TableRow
                key={member.id}
                className="cursor-pointer"
                onClick={() => router.push(`/team/${member.id}`)}
              >
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell>{member.discordUsername}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}</TableCell>
                <TableCell>
                  <Badge variant={member.status === MemberStatus.ACTIVE ? "default" : "secondary"}>
                    {MEMBER_STATUS_LABELS[member.status as keyof typeof MEMBER_STATUS_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.fixedSalary != null ? formatCurrency(member.fixedSalary) : "—"}
                </TableCell>
              </TableRow>
            ))}
            {(data?.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <TeamMemberForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
