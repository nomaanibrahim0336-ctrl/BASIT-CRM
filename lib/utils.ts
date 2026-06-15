import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatUSD(amount: number | string | null | undefined): string {
  return formatCurrency(amount);
}

export function formatPKR(amount: number | string | null | undefined): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return `${num.toFixed(2)}%`;
}
