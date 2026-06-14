"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DealForm } from "@/components/deals/DealForm";
import { useDeal, useDeleteDeal } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  BALANCE_STATUS_LABELS,
  DEAL_STAGE_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { UserRole } from "@/types/enums";

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { teamMember } = useAuth();
  const { data: deal, isLoading } = useDeal(params.id);
  const deleteDeal = useDeleteDeal();
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading || !deal) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const canEdit =
    teamMember?.role === UserRole.ADMIN ||
    teamMember?.role === UserRole.MERCHANT ||
    (teamMember?.role === UserRole.SALES_CLOSER && deal.assignedCloserId === teamMember.id) ||
    (teamMember?.role === UserRole.DESIGNER && deal.assignedDesignerId === teamMember.id);

  async function handleDelete() {
    if (!confirm("Delete this deal? This cannot be undone.")) return;
    try {
      await deleteDeal.mutateAsync(deal!.id);
      toast({ title: "Deal deleted" });
      router.push("/deals");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/deals")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deals
        </Button>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {teamMember?.role === UserRole.ADMIN && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{deal.dealName}</CardTitle>
            <div className="flex gap-2">
              <Badge>{DEAL_STAGE_LABELS[deal.dealStage]}</Badge>
              <Badge variant="secondary">{PRIORITY_LABELS[deal.priority]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Service Type" value={SERVICE_TYPE_LABELS[deal.serviceType]} />
          <Field label="Discord Channel" value={deal.discordChannel ?? "—"} />
          <Field label="Deal Value" value={formatCurrency(deal.dealValue)} />
          <Field label="Upfront Payment" value={formatCurrency(deal.upfrontPayment)} />
          <Field label="Balance Payment" value={formatCurrency(deal.balancePayment)} />
          <Field label="Balance Status" value={BALANCE_STATUS_LABELS[deal.balanceStatus]} />
          <Field label="Assigned Designer" value={deal.assignedDesigner?.fullName ?? "Unassigned"} />
          <Field label="Assigned Closer" value={deal.assignedCloser?.fullName ?? "Unassigned"} />
          <Field label="Lead" value={deal.lead?.clientName ?? "—"} />
          <Field label="Deadline" value={deal.deadline ? new Date(deal.deadline).toLocaleDateString() : "—"} />
          {deal.briefLink && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Brief Link</p>
              <a
                href={deal.briefLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand-400 hover:underline"
              >
                {deal.briefLink}
              </a>
            </div>
          )}
          {deal.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DealForm open={formOpen} onOpenChange={setFormOpen} deal={deal} />
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
