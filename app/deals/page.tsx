"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { DealsKanban } from "@/components/deals/DealsKanban";
import { DealsTable } from "@/components/deals/DealsTable";
import { DealForm } from "@/components/deals/DealForm";
import { useDeals } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, type DealStage } from "@/types/enums";

export default function DealsPage() {
  const { teamMember } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useDeals({ limit: "100" });
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [formOpen, setFormOpen] = useState(false);

  const updateStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) =>
      apiFetch(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify({ dealStage: stage }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast({ title: "Deal stage updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const canCreate = teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.SALES_CLOSER;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Deals</h1>
        <div className="flex gap-2">
          <Button variant={view === "kanban" ? "default" : "outline"} size="icon" onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} size="icon" onClick={() => setView("table")}>
            <List className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : view === "kanban" ? (
        <DealsKanban
          deals={data?.data ?? []}
          onStageChange={(id, stage) => updateStage.mutate({ id, stage })}
        />
      ) : (
        <DealsTable deals={data?.data ?? []} />
      )}

      <DealForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
