import {
  BalanceStatus,
  DealStage,
  ExpenseCategory,
  ExpenseType,
  LeadSource,
  LeadStatus,
  MemberStatus,
  PaidStatus,
  PayPeriod,
  PaymentMethod,
  PaymentType,
  Priority,
  ServiceType,
  SplitType,
  UserRole,
} from "@/types/enums";

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.LEAD_GENERATOR]: "Lead Generator",
  [UserRole.SALES_CLOSER]: "Sales Closer",
  [UserRole.DESIGNER]: "Designer",
  [UserRole.MERCHANT]: "Merchant",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "New",
  [LeadStatus.CONTACTED]: "Contacted",
  [LeadStatus.QUALIFIED]: "Qualified",
  [LeadStatus.NOT_INTERESTED]: "Not Interested",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.DISCORD_DM]: "Discord DM",
  [LeadSource.DISCORD_SERVER]: "Discord Server",
  [LeadSource.REFERRAL]: "Referral",
  [LeadSource.SOCIAL_MEDIA]: "Social Media",
  [LeadSource.OTHER]: "Other",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.LOGO]: "Logo Design",
  [ServiceType.SOCIAL_MEDIA]: "Social Media Graphics",
  [ServiceType.BRAND_KIT]: "Brand Kit",
  [ServiceType.PRINT]: "Print Materials",
  [ServiceType.UI_DESIGN]: "UI Design",
  [ServiceType.OTHER]: "Other",
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  [DealStage.WON]: "Won",
  [DealStage.DESIGN_BRIEFED]: "Design Briefed",
  [DealStage.IN_PROGRESS]: "In Progress",
  [DealStage.IN_REVISION]: "In Revision",
  [DealStage.DELIVERED]: "Delivered",
  [DealStage.COMPLETED]: "Completed",
  [DealStage.CANCELLED]: "Cancelled",
};

export const BALANCE_STATUS_LABELS: Record<BalanceStatus, string> = {
  [BalanceStatus.PENDING]: "Pending",
  [BalanceStatus.RECEIVED]: "Received",
  [BalanceStatus.NOT_PAID]: "Not Paid",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.HIGH]: "High",
  [Priority.MEDIUM]: "Medium",
  [Priority.LOW]: "Low",
};

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  [SplitType.FIXED_SALARY]: "Fixed Salary",
  [SplitType.COMMISSION]: "Commission",
  [SplitType.BONUS]: "Bonus",
};

export const PAY_PERIOD_LABELS: Record<PayPeriod, string> = {
  [PayPeriod.WEEKLY]: "Weekly",
  [PayPeriod.BIWEEKLY]: "Bi-weekly",
  [PayPeriod.MONTHLY]: "Monthly",
};

export const PAID_STATUS_LABELS: Record<PaidStatus, string> = {
  [PaidStatus.UNPAID]: "Unpaid",
  [PaidStatus.PAID]: "Paid",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.SOFTWARE_TOOLS]: "Software/Tools",
  [ExpenseCategory.ADVERTISING]: "Advertising",
  [ExpenseCategory.FREELANCERS]: "Freelancers",
  [ExpenseCategory.HOSTING]: "Hosting",
  [ExpenseCategory.OFFICE]: "Office",
  [ExpenseCategory.TRAVEL]: "Travel",
  [ExpenseCategory.OTHER]: "Other",
};

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  [ExpenseType.FIXED]: "Fixed (Recurring)",
  [ExpenseType.VARIABLE]: "Variable (One-time)",
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.UPFRONT]: "Upfront",
  [PaymentType.BALANCE]: "Balance",
  [PaymentType.FULL_PAYMENT]: "Full Payment",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.PAYPAL]: "PayPal",
  [PaymentMethod.CRYPTO]: "Crypto",
  [PaymentMethod.OTHER]: "Other",
};

// Role-based sidebar navigation map
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: "Active",
  [MemberStatus.INACTIVE]: "Inactive",
};

export const ROLE_NAV_ACCESS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    "dashboard",
    "leads",
    "deals",
    "design-queue",
    "finances-revenue",
    "finances-expenses",
    "finances-salary-splits",
    "finances-pnl",
    "team",
  ],
  [UserRole.LEAD_GENERATOR]: ["dashboard", "leads"],
  [UserRole.SALES_CLOSER]: ["dashboard", "leads", "deals"],
  [UserRole.DESIGNER]: ["dashboard", "design-queue"],
  [UserRole.MERCHANT]: ["dashboard", "finances-revenue", "finances-expenses"],
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  [DealStage.WON]: "#5865f2",
  [DealStage.DESIGN_BRIEFED]: "#8b5cf6",
  [DealStage.IN_PROGRESS]: "#f59e0b",
  [DealStage.IN_REVISION]: "#fb923c",
  [DealStage.DELIVERED]: "#22c55e",
  [DealStage.COMPLETED]: "#10b981",
  [DealStage.CANCELLED]: "#ef4444",
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.SOFTWARE_TOOLS]: "#5865f2",
  [ExpenseCategory.ADVERTISING]: "#f59e0b",
  [ExpenseCategory.FREELANCERS]: "#22c55e",
  [ExpenseCategory.HOSTING]: "#06b6d4",
  [ExpenseCategory.OFFICE]: "#8b5cf6",
  [ExpenseCategory.TRAVEL]: "#ec4899",
  [ExpenseCategory.OTHER]: "#6b7280",
};
