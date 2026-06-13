import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserRole } from "@/types/enums";

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell allowedRoles={[UserRole.ADMIN, UserRole.SALES_CLOSER]}>
      {children}
    </DashboardShell>
  );
}
