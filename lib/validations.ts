import { z } from "zod";
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

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

export const leadCreateSchema = z.object({
  clientName: z.string().min(1),
  companyName: z.string().optional().nullable(),
  discordUsername: z.string().min(1),
  contactInfo: z.string().optional().nullable(),
  serviceNeeded: z.enum(enumValues(ServiceType)),
  leadSource: z.enum(enumValues(LeadSource)),
  leadStatus: z.enum(enumValues(LeadStatus)).optional(),
  notes: z.string().optional().nullable(),
  assignedCloserId: z.string().uuid().optional().nullable(),
  generatedById: z.string().uuid().optional(),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const dealCreateSchema = z.object({
  dealName: z.string().min(1),
  discordChannel: z.string().optional().nullable(),
  serviceType: z.enum(enumValues(ServiceType)),
  dealValue: z.number().nonnegative(),
  upfrontPayment: z.number().nonnegative(),
  balancePayment: z.number().nonnegative(),
  balanceStatus: z.enum(enumValues(BalanceStatus)).optional(),
  dealStage: z.enum(enumValues(DealStage)).optional(),
  briefLink: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  dateWon: z.string().datetime().optional(),
  dateDelivered: z.string().datetime().optional().nullable(),
  priority: z.enum(enumValues(Priority)).optional(),
  notes: z.string().optional().nullable(),
  leadId: z.string().uuid(),
  assignedDesignerId: z.string().uuid().optional().nullable(),
  assignedCloserId: z.string().uuid().optional().nullable(),
});

export const dealUpdateSchema = dealCreateSchema.partial().omit({ leadId: true });

export const salarySplitCreateSchema = z.object({
  splitType: z.enum(enumValues(SplitType)),
  splitAmount: z.number().nonnegative(),
  splitPercentage: z.number().nonnegative().optional().nullable(),
  payPeriod: z.enum(enumValues(PayPeriod)),
  paidStatus: z.enum(enumValues(PaidStatus)).optional(),
  datePaid: z.string().datetime().optional().nullable(),
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
  teamMemberId: z.string().uuid(),
  dealId: z.string().uuid().optional().nullable(),
});

export const salarySplitUpdateSchema = salarySplitCreateSchema.partial();

export const payrollAdjustmentCreateSchema = z.object({
  label: z.string().min(1),
  amount: z.number(),
});

export const payrollInitializeSchema = z.object({
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

export const expenseCreateSchema = z.object({
  category: z.enum(enumValues(ExpenseCategory)),
  expenseType: z.enum(enumValues(ExpenseType)),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  dateIncurred: z.string().datetime(),
  receiptLink: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paidById: z.string().uuid().optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const revenueLogCreateSchema = z.object({
  amountReceived: z.number().nonnegative(),
  paymentType: z.enum(enumValues(PaymentType)),
  dateReceived: z.string().datetime(),
  paymentMethod: z.enum(enumValues(PaymentMethod)),
  confirmed: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  dealId: z.string().uuid(),
  handledById: z.string().uuid().optional(),
});

export const revenueLogUpdateSchema = revenueLogCreateSchema.partial();

export const exchangeRateCreateSchema = z.object({
  rate: z.number().positive(),
  effectiveDate: z.string().datetime().optional(),
});

export const teamCreateSchema = z.object({
  fullName: z.string().min(1),
  discordUsername: z.string().min(1),
  email: z.string().email(),
  role: z.enum(enumValues(UserRole)),
  status: z.enum(enumValues(MemberStatus)).optional(),
  fixedSalary: z.number().nonnegative().optional().nullable(),
  commissionRate: z.number().nonnegative().optional().nullable(),
  joinedDate: z.string().datetime().optional(),
  authUserId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export const teamUpdateSchema = teamCreateSchema.partial();
