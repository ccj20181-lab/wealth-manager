-- ============================================
-- Wealth Manager RLS Policies
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- ============================================

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- User Profiles Policies
-- ============================================
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- Asset Accounts Policies
-- ============================================
CREATE POLICY "Users can view own accounts"
  ON asset_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON asset_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON asset_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON asset_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Funds Policies (public read, admin write)
-- ============================================
CREATE POLICY "Anyone can view funds"
  ON funds FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert funds"
  ON funds FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update funds"
  ON funds FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete funds"
  ON funds FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- Fund Holdings Policies
-- ============================================
CREATE POLICY "Users can view own holdings"
  ON fund_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON fund_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON fund_holdings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON fund_holdings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Fund Transactions Policies
-- ============================================
CREATE POLICY "Users can view own fund transactions"
  ON fund_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fund transactions"
  ON fund_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fund transactions"
  ON fund_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fund transactions"
  ON fund_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Investment Plans Policies
-- ============================================
CREATE POLICY "Users can view own investment plans"
  ON investment_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment plans"
  ON investment_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment plans"
  ON investment_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment plans"
  ON investment_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Cashflow Categories Policies
-- ============================================
CREATE POLICY "Users can view system and own categories"
  ON cashflow_categories FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON cashflow_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own categories"
  ON cashflow_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own categories"
  ON cashflow_categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- ============================================
-- Cashflow Transactions Policies
-- ============================================
CREATE POLICY "Users can view own cashflow transactions"
  ON cashflow_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cashflow transactions"
  ON cashflow_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cashflow transactions"
  ON cashflow_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cashflow transactions"
  ON cashflow_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Budgets Policies
-- ============================================
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Financial Goals Policies
-- ============================================
CREATE POLICY "Users can view own goals"
  ON financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON financial_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Insurance Policies Policies
-- ============================================
CREATE POLICY "Users can view own insurance policies"
  ON insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insurance policies"
  ON insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance policies"
  ON insurance_policies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insurance policies"
  ON insurance_policies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Net Worth Snapshots Policies
-- ============================================
CREATE POLICY "Users can view own snapshots"
  ON net_worth_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON net_worth_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
  ON net_worth_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON net_worth_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Reminders Policies
-- ============================================
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);
