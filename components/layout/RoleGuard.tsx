"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/enums";

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, teamMember, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && teamMember && !allowedRoles.includes(teamMember.role)) {
      router.replace("/dashboard");
    }
  }, [loading, user, teamMember, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-discord-bg">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
