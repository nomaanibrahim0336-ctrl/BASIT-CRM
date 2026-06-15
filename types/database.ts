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
} from "./enums";

export interface Team {
  id: string;
  fullName: string;
  discordUsername: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  fixedSalary: number | null;
  commissionRate: number | null;
  joinedDate: string;
  authUserId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  clientName: string;
  companyName: string | null;
  discordUsername: string;
  contactInfo: string | null;
  serviceNeeded: ServiceType;
  leadSource: LeadSource;
  leadStatus: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedCloserId: string | null;
  generatedById: string;
  assignedCloser?: Team | null;
  generatedBy?: Team;
  deals?: Deal[];
}

export interface Deal {
  id: string;
  dealName: string;
  discordChannel: string | null;
  serviceType: ServiceType;
  dealValue: number;
  upfrontPayment: number;
  balancePayment: number;
  balanceStatus: BalanceStatus;
  dealStage: DealStage;
  briefLink: string | null;
  deadline: string | null;
  dateWon: string;
  dateDelivered: string | null;
  priority: Priority;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  assignedDesignerId: string | null;
  assignedCloserId: string | null;
  lead?: Lead;
  assignedDesigner?: Team | null;
  assignedCloser?: Team | null;
  salarySplits?: SalarySplit[];
  revenueLogs?: RevenueLog[];
}

export interface SalarySplit {
  id: string;
  splitType: SplitType;
  splitAmount: number;
  splitPercentage: number | null;
  payPeriod: PayPeriod;
  paidStatus: PaidStatus;
  datePaid: string | null;
  periodMonth: string | null;
  notes: string | null;
  createdAt: string;
  teamMemberId: string;
  dealId: string | null;
  teamMember?: Team;
  deal?: Deal;
  adjustments?: PayrollAdjustment[];
}

export interface PayrollAdjustment {
  id: string;
  salarySplitId: string;
  label: string;
  amount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  description: string;
  amount: number;
  dateIncurred: string;
  receiptLink: string | null;
  notes: string | null;
  createdAt: string;
  paidById: string | null;
  paidBy?: Team | null;
}

export interface RevenueLog {
  id: string;
  amountReceived: number;
  paymentType: PaymentType;
  dateReceived: string;
  paymentMethod: PaymentMethod;
  confirmed: boolean;
  notes: string | null;
  createdAt: string;
  dealId: string;
  handledById: string;
  deal?: Deal;
  handledBy?: Team;
}

export interface ExchangeRate {
  id: string;
  rate: number;
  effectiveDate: string;
  setById: string | null;
  createdAt: string;
}

export interface MonthlyPnL {
  id: string;
  month: string;
  year: number;
  totalRevenue: number;
  totalRevenueUsd: number;
  exchangeRate: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalSalaryPayouts: number;
  netProfit: number;
  profitMarginPct: number;
  notes: string | null;
  createdAt: string;
}
