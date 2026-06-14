"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { useTeamMember, useDeleteTeamMember } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MEMBER_STATUS_LABELS, ROLE_LABELS, DEAL_STAGE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { MemberStatus, UserRole } from "@/types/enums";

export default function TeamMemberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { teamMember: currentUser } = useAuth();
  const { data: member, isLoading } = useTeamMember(params.id);
  const deleteMember = useDeleteTeamMember();
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading || !member) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const data = member as any;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  async function handleDelete() {
    if (!confirm("Delete this team member? This cannot be undone.")) return;
    try {
      await deleteMember.mutateAsync(member!.id);
      toast({ title: "Team member deleted" });
      router.push("/team");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/team")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{member.fullName}</CardTitle>
            <Badge variant={member.status === MemberStatus.ACTIVE ? "default" : "secondary"}>
              {MEMBER_STATUS_LABELS[member.status as keyof typeof MEMBER_STATUS_LABELS]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" value={member.email} />
          <Field label="Discord Username" value={member.discordUsername} />
          <Field label="Role" value={ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]} />
          <Field label="Joined" value={new Date(member.joinedDate).toLocaleDateString()} />
          <Field
            label="Fixed Salary"
            value={member.fixedSalary != null ? formatCurrency(member.fixedSalary) : "—"}
          />
          <Field
            label="Commission Rate"
            value={member.commissionRate != null ? `${member.commissionRate}%` : "—"}
          />
          {member.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data.dealsAsCloser && data.dealsAsCloser.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deals as Closer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.dealsAsCloser.map((deal: any) => (
              <div
                key={deal.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 cursor-pointer transition-colors hover:bg-blue-500/[0.06] hover:border-white/10"
                onClick={() => router.push(`/deals/${deal.id}`)}
              >
                <div>
                  <p className="font-medium">{deal.dealName}</p>
                  <p className="text-sm text-muted-foreground">
                    {DEAL_STAGE_LABELS[deal.dealStage as keyof typeof DEAL_STAGE_LABELS]}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(deal.dealValue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.dealsAsDesigner && data.dealsAsDesigner.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deals as Designer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.dealsAsDesigner.map((deal: any) => (
              <div
                key={deal.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 cursor-pointer transition-colors hover:bg-blue-500/[0.06] hover:border-white/10"
                onClick={() => router.push(`/deals/${deal.id}`)}
              >
                <div>
                  <p className="font-medium">{deal.dealName}</p>
                  <p className="text-sm text-muted-foreground">
                    {DEAL_STAGE_LABELS[deal.dealStage as keyof typeof DEAL_STAGE_LABELS]}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(deal.dealValue)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.generatedLeads && data.generatedLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.generatedLeads.map((lead: any) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] p-3 cursor-pointer transition-colors hover:bg-blue-500/[0.06] hover:border-white/10"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <p className="font-medium">{lead.clientName}</p>
                <Badge>{LEAD_STATUS_LABELS[lead.leadStatus as keyof typeof LEAD_STATUS_LABELS]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <TeamMemberForm open={formOpen} onOpenChange={setFormOpen} member={member} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
