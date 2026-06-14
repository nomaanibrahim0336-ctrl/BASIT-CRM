-- Combined initial setup: run this once in the Supabase SQL Editor
-- (Settings -> SQL Editor -> New query) to create all tables, enums, and RLS policies.
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'lead_generator', 'sales_closer', 'designer', 'merchant');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'not_interested');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('discord_dm', 'discord_server', 'referral', 'social_media', 'other');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('logo', 'social_media', 'brand_kit', 'print', 'ui_design', 'other');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('won', 'design_briefed', 'in_progress', 'in_revision', 'delivered', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BalanceStatus" AS ENUM ('pending', 'received', 'not_paid');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('fixed_salary', 'commission', 'bonus');

-- CreateEnum
CREATE TYPE "PayPeriod" AS ENUM ('weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "PaidStatus" AS ENUM ('unpaid', 'paid');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('software_tools', 'advertising', 'freelancers', 'hosting', 'office', 'travel', 'other');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('fixed', 'variable');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('upfront', 'balance', 'full_payment');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('bank_transfer', 'paypal', 'crypto', 'other');

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "discord_username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "fixed_salary" DECIMAL(10,2),
    "commission_rate" DECIMAL(5,2),
    "joined_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auth_user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "company_name" TEXT,
    "discord_username" TEXT NOT NULL,
    "contact_info" TEXT,
    "service_needed" "ServiceType" NOT NULL,
    "lead_source" "LeadSource" NOT NULL,
    "lead_status" "LeadStatus" NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_closer_id" TEXT,
    "generated_by_id" TEXT NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "deal_name" TEXT NOT NULL,
    "discord_channel" TEXT,
    "service_type" "ServiceType" NOT NULL,
    "deal_value" DECIMAL(10,2) NOT NULL,
    "upfront_payment" DECIMAL(10,2) NOT NULL,
    "balance_payment" DECIMAL(10,2) NOT NULL,
    "balance_status" "BalanceStatus" NOT NULL DEFAULT 'pending',
    "deal_stage" "DealStage" NOT NULL DEFAULT 'won',
    "brief_link" TEXT,
    "deadline" TIMESTAMP(3),
    "date_won" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_delivered" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lead_id" TEXT NOT NULL,
    "assigned_designer_id" TEXT,
    "assigned_closer_id_deal" TEXT,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_splits" (
    "id" TEXT NOT NULL,
    "split_type" "SplitType" NOT NULL,
    "split_amount" DECIMAL(10,2) NOT NULL,
    "split_percentage" DECIMAL(5,2),
    "pay_period" "PayPeriod" NOT NULL,
    "paid_status" "PaidStatus" NOT NULL DEFAULT 'unpaid',
    "date_paid" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_member_id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,

    CONSTRAINT "salary_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "expense_type" "ExpenseType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date_incurred" TIMESTAMP(3) NOT NULL,
    "receipt_link" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_by_id" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_log" (
    "id" TEXT NOT NULL,
    "amount_received" DECIMAL(10,2) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "date_received" TIMESTAMP(3) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deal_id" TEXT NOT NULL,
    "handled_by_id" TEXT NOT NULL,

    CONSTRAINT "revenue_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_pnl" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "total_revenue" DECIMAL(12,2) NOT NULL,
    "total_fixed_expenses" DECIMAL(12,2) NOT NULL,
    "total_variable_expenses" DECIMAL(12,2) NOT NULL,
    "total_salary_payouts" DECIMAL(12,2) NOT NULL,
    "net_profit" DECIMAL(12,2) NOT NULL,
    "profit_margin_pct" DECIMAL(6,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_pnl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_email_key" ON "teams"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_auth_user_id_key" ON "teams"("auth_user_id");

-- CreateIndex
CREATE INDEX "leads_assigned_closer_id_idx" ON "leads"("assigned_closer_id");

-- CreateIndex
CREATE INDEX "leads_generated_by_id_idx" ON "leads"("generated_by_id");

-- CreateIndex
CREATE INDEX "leads_lead_status_idx" ON "leads"("lead_status");

-- CreateIndex
CREATE INDEX "deals_lead_id_idx" ON "deals"("lead_id");

-- CreateIndex
CREATE INDEX "deals_assigned_designer_id_idx" ON "deals"("assigned_designer_id");

-- CreateIndex
CREATE INDEX "deals_assigned_closer_id_deal_idx" ON "deals"("assigned_closer_id_deal");

-- CreateIndex
CREATE INDEX "deals_deal_stage_idx" ON "deals"("deal_stage");

-- CreateIndex
CREATE INDEX "deals_balance_status_idx" ON "deals"("balance_status");

-- CreateIndex
CREATE INDEX "salary_splits_team_member_id_idx" ON "salary_splits"("team_member_id");

-- CreateIndex
CREATE INDEX "salary_splits_deal_id_idx" ON "salary_splits"("deal_id");

-- CreateIndex
CREATE INDEX "salary_splits_paid_status_idx" ON "salary_splits"("paid_status");

-- CreateIndex
CREATE INDEX "expenses_paid_by_id_idx" ON "expenses"("paid_by_id");

-- CreateIndex
CREATE INDEX "expenses_date_incurred_idx" ON "expenses"("date_incurred");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "revenue_log_deal_id_idx" ON "revenue_log"("deal_id");

-- CreateIndex
CREATE INDEX "revenue_log_handled_by_id_idx" ON "revenue_log"("handled_by_id");

-- CreateIndex
CREATE INDEX "revenue_log_date_received_idx" ON "revenue_log"("date_received");

-- CreateIndex
CREATE INDEX "monthly_pnl_year_month_idx" ON "monthly_pnl"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_pnl_month_year_key" ON "monthly_pnl"("month", "year");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_closer_id_fkey" FOREIGN KEY ("assigned_closer_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_designer_id_fkey" FOREIGN KEY ("assigned_designer_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_closer_id_deal_fkey" FOREIGN KEY ("assigned_closer_id_deal") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_splits" ADD CONSTRAINT "salary_splits_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_splits" ADD CONSTRAINT "salary_splits_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_log" ADD CONSTRAINT "revenue_log_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_log" ADD CONSTRAINT "revenue_log_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security policies for the Graphic Business CRM
-- Run this against the Supabase Postgres database after `prisma db push` / `prisma migrate deploy`.

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

-- Returns the role of the currently authenticated user, looked up via teams.auth_user_id.
create or replace function get_user_role()
returns "UserRole"
language sql
security definer
stable
set search_path = public
as $$
  select role from teams where auth_user_id = auth.uid();
$$;

-- Returns the team member id of the currently authenticated user.
create or replace function get_user_team_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select id from teams where auth_user_id = auth.uid();
$$;

-- ─── ENABLE RLS ─────────────────────────────────────────────────────────────

alter table teams enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table salary_splits enable row level security;
alter table expenses enable row level security;
alter table revenue_log enable row level security;
alter table monthly_pnl enable row level security;

-- ─── TEAMS ──────────────────────────────────────────────────────────────────

-- Admins can do everything with team records.
create policy "teams_admin_all" on teams
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Any authenticated team member can view all team records (needed for assignment dropdowns, etc).
create policy "teams_select_authenticated" on teams
  for select
  using (auth.uid() is not null);

-- Team members can update their own profile (notes/contact info).
create policy "teams_update_own" on teams
  for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ─── LEADS ──────────────────────────────────────────────────────────────────

-- Admins can do everything with leads.
create policy "leads_admin_all" on leads
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Lead generators can view and create leads they generated.
create policy "leads_select_generator" on leads
  for select
  using (get_user_role() = 'lead_generator' and generated_by_id = get_user_team_id());

create policy "leads_insert_generator" on leads
  for insert
  with check (get_user_role() = 'lead_generator' and generated_by_id = get_user_team_id());

create policy "leads_update_generator" on leads
  for update
  using (get_user_role() = 'lead_generator' and generated_by_id = get_user_team_id())
  with check (get_user_role() = 'lead_generator' and generated_by_id = get_user_team_id());

-- Sales closers can view and update leads assigned to them.
create policy "leads_select_closer" on leads
  for select
  using (get_user_role() = 'sales_closer' and assigned_closer_id = get_user_team_id());

create policy "leads_update_closer" on leads
  for update
  using (get_user_role() = 'sales_closer' and assigned_closer_id = get_user_team_id())
  with check (get_user_role() = 'sales_closer' and assigned_closer_id = get_user_team_id());

-- ─── DEALS ──────────────────────────────────────────────────────────────────

-- Admins can do everything with deals.
create policy "deals_admin_all" on deals
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Sales closers can view and update deals assigned to them.
create policy "deals_select_closer" on deals
  for select
  using (get_user_role() = 'sales_closer' and assigned_closer_id_deal = get_user_team_id());

create policy "deals_update_closer" on deals
  for update
  using (get_user_role() = 'sales_closer' and assigned_closer_id_deal = get_user_team_id())
  with check (get_user_role() = 'sales_closer' and assigned_closer_id_deal = get_user_team_id());

-- Designers can view and update deals assigned to them (design queue).
create policy "deals_select_designer" on deals
  for select
  using (get_user_role() = 'designer' and assigned_designer_id = get_user_team_id());

create policy "deals_update_designer" on deals
  for update
  using (get_user_role() = 'designer' and assigned_designer_id = get_user_team_id())
  with check (get_user_role() = 'designer' and assigned_designer_id = get_user_team_id());

-- Merchants can view all deals (needed for revenue logging context).
create policy "deals_select_merchant" on deals
  for select
  using (get_user_role() = 'merchant');

-- Lead generators can view deals tied to leads they generated.
create policy "deals_select_generator" on deals
  for select
  using (
    get_user_role() = 'lead_generator'
    and lead_id in (select id from leads where generated_by_id = get_user_team_id())
  );

-- ─── SALARY SPLITS ──────────────────────────────────────────────────────────

-- Admins can do everything with salary splits.
create policy "salary_splits_admin_all" on salary_splits
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Team members can view their own salary splits.
create policy "salary_splits_select_own" on salary_splits
  for select
  using (team_member_id = get_user_team_id());

-- ─── EXPENSES ───────────────────────────────────────────────────────────────

-- Admins can do everything with expenses.
create policy "expenses_admin_all" on expenses
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Merchants can view and create expenses.
create policy "expenses_select_merchant" on expenses
  for select
  using (get_user_role() = 'merchant');

create policy "expenses_insert_merchant" on expenses
  for insert
  with check (get_user_role() = 'merchant');

-- ─── REVENUE LOG ────────────────────────────────────────────────────────────

-- Admins can do everything with revenue log entries.
create policy "revenue_log_admin_all" on revenue_log
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Merchants can view, create, and update revenue log entries.
create policy "revenue_log_select_merchant" on revenue_log
  for select
  using (get_user_role() = 'merchant');

create policy "revenue_log_insert_merchant" on revenue_log
  for insert
  with check (get_user_role() = 'merchant');

create policy "revenue_log_update_merchant" on revenue_log
  for update
  using (get_user_role() = 'merchant')
  with check (get_user_role() = 'merchant');

-- Sales closers can view revenue log entries for deals they closed.
create policy "revenue_log_select_closer" on revenue_log
  for select
  using (
    get_user_role() = 'sales_closer'
    and deal_id in (select id from deals where assigned_closer_id_deal = get_user_team_id())
  );

-- ─── MONTHLY P&L ────────────────────────────────────────────────────────────

-- Admins can do everything with monthly P&L records.
create policy "monthly_pnl_admin_all" on monthly_pnl
  for all
  using (get_user_role() = 'admin')
  with check (get_user_role() = 'admin');

-- Merchants can view monthly P&L records.
create policy "monthly_pnl_select_merchant" on monthly_pnl
  for select
  using (get_user_role() = 'merchant');
