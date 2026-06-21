"use client";

import { useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDailyLeadCounts, useIncrementDailyLeadCount } from "@/hooks/useLeads";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLeadCountWidget() {
  const { toast } = useToast();
  const { data } = useDailyLeadCounts();
  const increment = useIncrementDailyLeadCount();

  const todayEntry = useMemo(
    () => data?.data.find((entry) => entry.logDate.slice(0, 10) === todayKey()),
    [data]
  );

  async function bump(delta: number) {
    try {
      await increment.mutateAsync(delta);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => bump(-1)}
            disabled={increment.isPending || !todayEntry?.count}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[110px]">
            <div className="text-2xl font-bold">{todayEntry?.count ?? 0}</div>
            <div className="text-xs text-muted-foreground">Leads Today</div>
          </div>
          <Button variant="outline" size="icon" onClick={() => bump(1)} disabled={increment.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">{data?.totalLeads ?? 0}</div>
          <div className="text-xs text-muted-foreground">Total Leads (All Time)</div>
        </div>
      </CardContent>
    </Card>
  );
}
