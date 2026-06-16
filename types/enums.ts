export enum UserRole {
  ADMIN = "admin",
  LEAD_GENERATOR = "lead_generator",
  SALES_CLOSER = "sales_closer",
  DESIGNER = "designer",
  MERCHANT = "merchant",
}

export enum MemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  NOT_INTERESTED = "not_interested",
}

export enum LeadSource {
  DISCORD_DM = "discord_dm",
  DISCORD_SERVER = "discord_server",
  REFERRAL = "referral",
  SOCIAL_MEDIA = "social_media",
  OTHER = "other",
}

export enum ServiceType {
  LOGO = "logo",
  SOCIAL_MEDIA = "social_media",
  BRAND_KIT = "brand_kit",
  PRINT = "print",
  UI_DESIGN = "ui_design",
  OTHER = "other",
}

export enum DealStage {
  WON = "won",
  DESIGN_BRIEFED = "design_briefed",
  IN_PROGRESS = "in_progress",
  IN_REVISION = "in_revision",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum BalanceStatus {
  PENDING = "pending",
  RECEIVED = "received",
  NOT_PAID = "not_paid",
}

export enum Priority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum SplitType {
  FIXED_SALARY = "fixed_salary",
  COMMISSION = "commission",
  BONUS = "bonus",
  HYBRID = "hybrid",
}

export enum PayPeriod {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
}

export enum PaidStatus {
  UNPAID = "unpaid",
  PAID = "paid",
}

export enum ExpenseCategory {
  SOFTWARE_TOOLS = "software_tools",
  ADVERTISING = "advertising",
  FREELANCERS = "freelancers",
  HOSTING = "hosting",
  OFFICE = "office",
  TRAVEL = "travel",
  OTHER = "other",
}

export enum ExpenseType {
  FIXED = "fixed",
  VARIABLE = "variable",
}

export enum PaymentType {
  UPFRONT = "upfront",
  BALANCE = "balance",
  FULL_PAYMENT = "full_payment",
}

export enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  PAYPAL = "paypal",
  CRYPTO = "crypto",
  OTHER = "other",
}
