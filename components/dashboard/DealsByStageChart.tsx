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

  const hasData = chartData.some((d) => d.count > 0);

  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Deals by Stage</h3>
          <p className="text-xs text-slate-400">Distribution across the pipeline</p>
        </div>
        <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
          Pipeline
        </span>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" vertical={false} />
            <XAxis
              dataKey="stage"
              stroke="#94a3b8"
              fontSize={11}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={70}
              tickLine={false}
              axisLine={{ stroke: "#1e2a44" }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
              contentStyle={{
                backgroundColor: "#0d1426",
                border: "1px solid #1e2a44",
                borderRadius: "0.5rem",
                boxShadow: "0 12px 32px -12px rgba(0,0,0,0.7)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
              itemStyle={{ color: "#93c5fd" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color || "url(#barBlue)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 text-center">
          <p className="text-sm font-medium text-slate-300">No deals yet</p>
          <p className="text-xs text-slate-500">
            Your pipeline chart will appear here once deals are added.
          </p>
        </div>
      )}
    </div>
  );
}
