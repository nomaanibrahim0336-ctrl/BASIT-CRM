"use client";

import { useRouter } from "next/navigation";
import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/constants";
import { Priority } from "@/types/enums";
import type { Deal } from "@/types/database";

interface DealCardProps {
  deal: Deal;
  index: number;
}

const PRIORITY_VARIANT: Record<Priority, "destructive" | "secondary" | "outline"> = {
  [Priority.HIGH]: "destructive",
  [Priority.MEDIUM]: "secondary",
  [Priority.LOW]: "outline",
};

export function DealCard({ deal, index }: DealCardProps) {
  const router = useRouter();

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style as React.CSSProperties}
          onClick={() => router.push(`/deals/${deal.id}`)}
        >
          <Card
            className={`border-white/[0.06] bg-card/80 cursor-pointer transition-all hover:border-white/10 hover:-translate-y-0.5 ${
              snapshot.isDragging ? "shadow-brand-glow ring-2 ring-brand-500" : ""
            }`}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{deal.dealName}</p>
                <Badge variant={PRIORITY_VARIANT[deal.priority]} className="shrink-0">
                  {PRIORITY_LABELS[deal.priority]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatCurrency(deal.dealValue)}</p>
              {deal.assignedDesigner && (
                <p className="text-xs text-muted-foreground">
                  Designer: {deal.assignedDesigner.fullName}
                </p>
              )}
              {deal.deadline && (
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(deal.deadline).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
