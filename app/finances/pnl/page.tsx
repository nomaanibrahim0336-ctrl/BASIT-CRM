"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMonthlyPnL, useRecalculatePnL } from "@/hooks/useFinances";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { UserRole } from "@/types/enums";

export default function PnLPage() {
  const { data, isLoading } = useMonthlyPnL();
  const { teamMember } = useAuth();
  const { toast } = useToast();
  const recalculate = useRecalculatePnL();

  const canRecalculate =
    teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.MERCHANT;

  const records = (data?.data ?? []).slice().reverse();
  const chartData = records.map((r) => ({
    label: `${r.month} ${r.year}`,
    revenue: r.totalRevenue,
    expenses: r.totalFixedExpenses + r.totalVariableExpenses + r.totalSalaryPayouts,
    netProfit: r.netProfit,
  }));

  async function handleRecalculate() {
    try {
      await recalculate.mutateAsync();
      toast({ title: "P&L recalculated for the current month" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profit &amp; Loss</h1>
        {canRecalculate && (
          <Button variant="outline" onClick={handleRecalculate} disabled={recalculate.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recalculate Current Month
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue vs Expenses vs Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#36373d" />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "#23242a", border: "1px solid #36373d" }} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" fill="#5865f2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profit Margin Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={records.map((r) => ({ label: `${r.month} ${r.year}`, margin: r.profitMarginPct }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#36373d" />
                  <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "#23242a", border: "1px solid #36373d" }} />
                  <Line type="monotone" dataKey="margin" stroke="#5865f2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Fixed Expenses</TableHead>
                <TableHead>Variable Expenses</TableHead>
                <TableHead>Salary Payouts</TableHead>
                <TableHead>Net Profit</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.month} {row.year}
                  </TableCell>
                  <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
                  <TableCell>{formatCurrency(row.totalFixedExpenses)}</TableCell>
                  <TableCell>{formatCurrency(row.totalVariableExpenses)}</TableCell>
                  <TableCell>{formatCurrency(row.totalSalaryPayouts)}</TableCell>
                  <TableCell>{formatCurrency(row.netProfit)}</TableCell>
                  <TableCell>{formatPercent(row.profitMarginPct)}</TableCell>
                </TableRow>
              ))}
              {(data?.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No P&amp;L records yet. Records are generated monthly.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
