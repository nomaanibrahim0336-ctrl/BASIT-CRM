"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from "@/lib/constants";
import { DealStage } from "@/types/enums";

interface DealsByStageChartProps {
  data: { dealStage: DealStage; _count: { _all: number } }[];
}

export function DealsByStageChart({ data }: DealsByStageChartProps) {
  const chartData = data.map((d) => ({
    stage: DEAL_STAGE_LABELS[d.dealStage],
    count: d._count._all,
    color: DEAL_STAGE_COLORS[d.dealStage],
  }));

  return (
    <Card className="border-discord-border bg-discord-card">
      <CardHeader>
        <CardTitle className="text-base">Deals by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#36373d" />
            <XAxis dataKey="stage" stroke="#9ca3af" fontSize={12} interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#23242a", border: "1px solid #36373d" }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
