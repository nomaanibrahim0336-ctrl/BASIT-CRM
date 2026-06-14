"use client";

import { useRouter } from "next/navigation";
import { Users, UserCog, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamMembers } from "@/hooks/useTeam";
import { ROLE_LABELS, MEMBER_STATUS_LABELS } from "@/lib/constants";
import { MemberStatus, UserRole } from "@/types/enums";

export default function SettingsPage() {
  const router = useRouter();
  const { data, isLoading } = useTeamMembers();
  const members = data?.data ?? [];

  const total = members.length;
  const active = members.filter((m) => m.status === MemberStatus.ACTIVE).length;
  const inactive = total - active;

  const roleCounts = Object.values(UserRole).reduce<Record<string, number>>((acc, role) => {
    acc[role] = members.filter((m) => m.role === role).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admin Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workforce, roles, and overall CRM configuration.
        </p>
      </div>

      {/* Workforce overview */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Workforce Overview</h2>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inactive}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Roles in Use</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(roleCounts).filter((c) => c > 0).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Roles breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Roles Breakdown</CardTitle>
          <CardDescription>How many team members hold each role</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <Badge key={role} variant="secondary" className="text-sm">
              {label}: {roleCounts[role] ?? 0}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Management actions */}
      <Card>
        <CardHeader>
          <CardTitle>Workforce Management</CardTitle>
          <CardDescription>
            Add, edit, or remove team members and control their access and login accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/team")}>
            <UserCog className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        </CardContent>
      </Card>

      {/* CRM configuration - placeholders for future expansion */}
      <Card>
        <CardHeader>
          <CardTitle>CRM Configuration</CardTitle>
          <CardDescription>
            General settings and operational preferences. More controls will appear here as
            the CRM grows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-discord-border p-3">
            <div>
              <p className="text-sm font-medium">Member Statuses</p>
              <p className="text-xs text-muted-foreground">
                {Object.values(MEMBER_STATUS_LABELS).join(" / ")}
              </p>
            </div>
            <Badge variant="outline">Read-only</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-discord-border p-3">
            <div>
              <p className="text-sm font-medium">Roles & Permissions</p>
              <p className="text-xs text-muted-foreground">
                Each role has its own dashboard view and sidebar access.
              </p>
            </div>
            <Badge variant="outline">Read-only</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-discord-border p-3">
            <div>
              <p className="text-sm font-medium">Google Sheets Sync</p>
              <p className="text-xs text-muted-foreground">
                Sync team and finance data to Google Sheets from the Team page.
              </p>
            </div>
            <Badge variant="outline">Configured via env</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
