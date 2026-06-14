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
  select role from teams where auth_user_id = auth.uid()::text;
$$;

-- Returns the team member id of the currently authenticated user.
create or replace function get_user_team_id()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select id from teams where auth_user_id = auth.uid()::text;
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
  using (auth_user_id = auth.uid()::text)
  with check (auth_user_id = auth.uid()::text);

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
