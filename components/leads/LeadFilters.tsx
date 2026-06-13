"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";

export interface LeadFiltersValue {
  search: string;
  status: string;
  source: string;
}

interface LeadFiltersProps {
  value: LeadFiltersValue;
  onChange: (value: LeadFiltersValue) => void;
}

const ALL = "all";

export function LeadFilters({ value, onChange }: LeadFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search leads..."
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        className="sm:max-w-xs"
      />
      <Select
        value={value.status || ALL}
        onValueChange={(status) => onChange({ ...value, status: status === ALL ? "" : status })}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([val, label]) => (
            <SelectItem key={val} value={val}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.source || ALL}
        onValueChange={(source) => onChange({ ...value, source: source === ALL ? "" : source })}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="All sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All sources</SelectItem>
          {Object.entries(LEAD_SOURCE_LABELS).map(([val, label]) => (
            <SelectItem key={val} value={val}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
