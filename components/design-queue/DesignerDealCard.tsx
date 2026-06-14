"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGE_LABELS, PRIORITY_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";
import { Priority } from "@/types/enums";
import type { Deal } from "@/types/database";

const PRIORITY_VARIANT: Record<Priority, "destructive" | "secondary" | "outline"> = {
  [Priority.HIGH]: "destructive",
  [Priority.MEDIUM]: "secondary",
  [Priority.LOW]: "outline",
};

export function DesignerDealCard({ deal }: { deal: Deal }) {
  const router = useRouter();

  return (
    <Card
      className="border-white/[0.06] bg-card/80 cursor-pointer transition-all hover:border-white/10 hover:-translate-y-0.5"
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{deal.dealName}</p>
          <Badge variant={PRIORITY_VARIANT[deal.priority]}>{PRIORITY_LABELS[deal.priority]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{SERVICE_TYPE_LABELS[deal.serviceType]}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{DEAL_STAGE_LABELS[deal.dealStage]}</span>
          {deal.deadline && <span>Due {new Date(deal.deadline).toLocaleDateString()}</span>}
        </div>
        {deal.briefLink && (
          <a
            href={deal.briefLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-brand-400 hover:underline"
          >
            View Brief
          </a>
        )}
      </CardContent>
    </Card>
  );
}
