"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DesignerDealCard } from "@/components/design-queue/DesignerDealCard";
import { useDesignQueue } from "@/hooks/useDesignQueue";
import { DEAL_STAGE_LABELS } from "@/lib/constants";
import { DealStage } from "@/types/enums";

const SECTIONS = [DealStage.DESIGN_BRIEFED, DealStage.IN_PROGRESS, DealStage.IN_REVISION];

export default function DesignQueuePage() {
  const { data: deals, isLoading } = useDesignQueue();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Design Queue</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        SECTIONS.map((stage) => {
          const stageDeals = (deals ?? []).filter((d) => d.dealStage === stage);
          return (
            <div key={stage} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {DEAL_STAGE_LABELS[stage]} ({stageDeals.length})
              </h2>
              {stageDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals in this stage.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stageDeals.map((deal) => (
                    <DesignerDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
