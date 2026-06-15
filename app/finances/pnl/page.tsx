"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, ArrowRightLeft } from "lucide-react";
import { useMonthlyPnL, useRecalculatePnL, useExchangeRate, useSetExchangeRate } from "@/hooks/useFinances";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatPKR, formatUSD, formatPercent } from "@/lib/utils";
import { UserRole } from "@/types/enums";

export default function PnLPage() {
  const { data, isLoading } = useMonthlyPnL();
  const { teamMember } = useAuth();
  const { toast } = useToast();
  const recalculate = useRecalculatePnL();
  const { data: exchangeRate } = useExchangeRate();
  const setExchangeRate = useSetExchangeRate();
  const [rateInput, setRateInput] = useState("");

  const canRecalculate =
    teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.MERCHANT;

  useEffect(() => {
    if (exchangeRate?.rate) setRateInput(String(exchangeRate.rate));
  }, [exchangeRate?.rate]);

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

  async function handleSetRate() {
    const rate = Number(rateInput);
    if (!rate || rate <= 0) return;
    try {
      await setExchangeRate.mutateAsync({ rate });
      toast({ title: "Exchange rate updated" });
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            USD → PKR Exchange Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">1 USD =</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.01"
              className="w-40"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              disabled={!canRecalculate}
            />
          </div>
          <span className="pb-2 text-sm text-muted-foreground">PKR</span>
          {canRecalculate && (
            <Button onClick={handleSetRate} disabled={setExchangeRate.isPending}>
              Update Rate
            </Button>
          )}
          {exchangeRate?.effectiveDate && (
            <span className="pb-2 text-xs text-muted-foreground">
              Last set {new Date(exchangeRate.effectiveDate).toLocaleString()}
            </span>
          )}
        </CardContent>
      </Card>

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
                  <Tooltip
                    contentStyle={{ backgroundColor: "#23242a", border: "1px solid #36373d" }}
                    formatter={(value: number) => formatPKR(value)}
                  />
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
                <TableHead>Revenue (USD)</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Revenue (PKR)</TableHead>
                <TableHead>Fixed Expenses</TableHead>
                <TableHead>Variable Expenses</TableHead>
                <TableHead>Salary Payouts</TableHead>
                <TableHead>Net Profit (PKR)</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.month} {row.year}
                  </TableCell>
                  <TableCell>{formatUSD(row.totalRevenueUsd)}</TableCell>
                  <TableCell>{row.exchangeRate ? row.exchangeRate.toFixed(2) : "—"}</TableCell>
                  <TableCell>{formatPKR(row.totalRevenue)}</TableCell>
                  <TableCell>{formatPKR(row.totalFixedExpenses)}</TableCell>
                  <TableCell>{formatPKR(row.totalVariableExpenses)}</TableCell>
                  <TableCell>{formatPKR(row.totalSalaryPayouts)}</TableCell>
                  <TableCell>{formatPKR(row.netProfit)}</TableCell>
                  <TableCell>{formatPercent(row.profitMarginPct)}</TableCell>
                </TableRow>
              ))}
              {(data?.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
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
