"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreatePayrollAdjustment, useDeletePayrollAdjustment } from "@/hooks/useFinances";
import { formatPKR } from "@/lib/utils";
import type { SalarySplit } from "@/types/database";

interface AdjustmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  split: SalarySplit;
}

export function AdjustmentsDialog({ open, onOpenChange, split }: AdjustmentsDialogProps) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const createAdjustment = useCreatePayrollAdjustment(split.id);
  const deleteAdjustment = useDeletePayrollAdjustment(split.id);

  const adjustments = split.adjustments ?? [];
  const adjustmentsTotal = adjustments.reduce((sum, a) => sum + a.amount, 0);
  const netTotal = split.splitAmount + adjustmentsTotal;

  async function handleAdd() {
    if (!label.trim() || amount === "" || Number(amount) === 0) return;
    try {
      await createAdjustment.mutateAsync({ label: label.trim(), amount: Number(amount) });
      setLabel("");
      setAmount("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdjustment.mutateAsync(id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjustments — {split.teamMember?.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Amount</span>
            <span className="font-medium">{formatPKR(split.splitAmount)}</span>
          </div>

          {adjustments.length > 0 && (
            <div className="space-y-1">
              {adjustments.map((adj) => (
                <div key={adj.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2 text-sm">
                  <span>{adj.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={adj.amount < 0 ? "text-red-400" : "text-emerald-400"}>
                      {adj.amount < 0 ? "-" : "+"}
                      {formatPKR(Math.abs(adj.amount))}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(adj.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm font-semibold">
            <span>Net Total</span>
            <span>{formatPKR(netTotal)}</span>
          </div>

          <div className="space-y-2 rounded-lg border border-white/10 p-3">
            <Label>Add Adjustment</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                className="col-span-2"
                placeholder="e.g. Bonus, Late penalty"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="+/- amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use a positive number for bonuses/commission/overtime, negative for deductions/penalties/advances.
            </p>
            <Button type="button" size="sm" onClick={handleAdd} disabled={createAdjustment.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
