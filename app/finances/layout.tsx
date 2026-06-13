import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserRole } from "@/types/enums";

export default function FinancesLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell allowedRoles={[UserRole.ADMIN, UserRole.MERCHANT]}>
      {children}
    </DashboardShell>
  );
}
