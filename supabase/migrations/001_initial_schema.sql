-- ============================================
-- Wealth Manager Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for personal finance management
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. User Profiles - 用户扩展信息
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'CNY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS '用户扩展信息表';
COMMENT ON COLUMN user_profiles.currency IS '用户默认货币单位';

-- ============================================
-- 2. Asset Accounts - 资产账户
-- ============================================
CREATE TABLE asset_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'fund', 'pension', 'insurance', 'other')),
  balance DECIMAL(15,2) DEFAULT 0,
  institution TEXT,
  account_number TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_accounts_user_id ON asset_accounts(user_id);
CREATE INDEX idx_asset_accounts_type ON asset_accounts(type);

COMMENT ON TABLE asset_accounts IS '资产账户表（银行卡、基金账户、养老金账户等）';
COMMENT ON COLUMN asset_accounts.type IS '账户类型：bank-银行, fund-基金, pension-养老金, insurance-保险, other-其他';

-- ============================================
-- 3. Funds - 基金信息
-- ============================================
CREATE TABLE funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('stock', 'bond', 'money', 'mixed', 'gold', 'qdii', 'other')),
  nav DECIMAL(10,4),
  nav_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funds_code ON funds(code);
CREATE INDEX idx_funds_type ON funds(type);

COMMENT ON TABLE funds IS '基金信息表';
COMMENT ON COLUMN funds.code IS '基金代码';
COMMENT ON COLUMN funds.nav IS '最新净值';
COMMENT ON COLUMN funds.type IS '基金类型：stock-股票型, bond-债券型, money-货币型, mixed-混合型, gold-黄金, qdii-QDII, other-其他';

-- ============================================
-- 4. Fund Holdings - 基金持仓
-- ============================================
CREATE TABLE fund_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES asset_accounts(id) ON DELETE SET NULL,
  fund_id UUID NOT NULL REFERENCES funds(id),
  shares DECIMAL(15,4) NOT NULL DEFAULT 0,
  cost_basis DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fund_id, account_id)
);

CREATE INDEX idx_fund_holdings_user_id ON fund_holdings(user_id);
CREATE INDEX idx_fund_holdings_fund_id ON fund_holdings(fund_id);

COMMENT ON TABLE fund_holdings IS '基金持仓表';
COMMENT ON COLUMN fund_holdings.shares IS '持有份额';
COMMENT ON COLUMN fund_holdings.cost_basis IS '持仓成本';

-- ============================================
-- 5. Fund Transactions - 基金交易记录
-- ============================================
CREATE TABLE fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES fund_holdings(id) ON DELETE SET NULL,
  fund_id UUID NOT NULL REFERENCES funds(id),
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'split')),
  shares DECIMAL(15,4),
  nav DECIMAL(10,4),
  amount DECIMAL(15,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fund_transactions_user_id ON fund_transactions(user_id);
CREATE INDEX idx_fund_transactions_fund_id ON fund_transactions(fund_id);
CREATE INDEX idx_fund_transactions_date ON fund_transactions(transaction_date);

COMMENT ON TABLE fund_transactions IS '基金交易记录表';
COMMENT ON COLUMN fund_transactions.type IS '交易类型：buy-买入, sell-卖出, dividend-分红, split-拆分';

-- ============================================
-- 6. Investment Plans - 定投计划
-- ============================================
CREATE TABLE investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fund_id UUID NOT NULL REFERENCES funds(id),
  account_id UUID REFERENCES asset_accounts(id),
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_active BOOLEAN DEFAULT true,
  next_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investment_plans_user_id ON investment_plans(user_id);
CREATE INDEX idx_investment_plans_next_date ON investment_plans(next_date) WHERE is_active = true;

COMMENT ON TABLE investment_plans IS '定投计划表';
COMMENT ON COLUMN investment_plans.frequency IS '定投频率：daily-每日, weekly-每周, biweekly-每两周, monthly-每月';

-- ============================================
-- 7. Cashflow Categories - 收支分类
-- ============================================
CREATE TABLE cashflow_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES cashflow_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cashflow_categories_user_id ON cashflow_categories(user_id);
CREATE INDEX idx_cashflow_categories_type ON cashflow_categories(type);

COMMENT ON TABLE cashflow_categories IS '收支分类表';
COMMENT ON COLUMN cashflow_categories.user_id IS 'NULL 表示系统预设分类';
COMMENT ON COLUMN cashflow_categories.type IS '分类类型：income-收入, expense-支出';

-- ============================================
-- 8. Cashflow Transactions - 收支记录
-- ============================================
CREATE TABLE cashflow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES asset_accounts(id),
  category_id UUID REFERENCES cashflow_categories(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cashflow_transactions_user_id ON cashflow_transactions(user_id);
CREATE INDEX idx_cashflow_transactions_date ON cashflow_transactions(transaction_date);
CREATE INDEX idx_cashflow_transactions_category ON cashflow_transactions(category_id);
CREATE INDEX idx_cashflow_transactions_type ON cashflow_transactions(type);

COMMENT ON TABLE cashflow_transactions IS '收支记录表';
COMMENT ON COLUMN cashflow_transactions.type IS '交易类型：income-收入, expense-支出, transfer-转账';

-- ============================================
-- 9. Budgets - 预算
-- ============================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES cashflow_categories(id),
  amount DECIMAL(15,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'yearly')),
  start_date DATE,
  end_date DATE,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);

COMMENT ON TABLE budgets IS '预算表';
COMMENT ON COLUMN budgets.alert_threshold IS '预警阈值，默认80%';

-- ============================================
-- 10. Financial Goals - 理财目标
-- ============================================
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  category TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);

COMMENT ON TABLE financial_goals IS '理财目标表';
COMMENT ON COLUMN financial_goals.priority IS '优先级 1-5，1为最高';

-- ============================================
-- 11. Insurance Policies - 保险保单
-- ============================================
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('life', 'health', 'property', 'auto', 'other')),
  provider TEXT,
  policy_number TEXT,
  premium DECIMAL(10,2),
  premium_frequency TEXT CHECK (premium_frequency IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  coverage_amount DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  beneficiary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX idx_insurance_policies_type ON insurance_policies(type);

COMMENT ON TABLE insurance_policies IS '保险保单表';
COMMENT ON COLUMN insurance_policies.type IS '保险类型：life-寿险, health-健康险, property-财产险, auto-车险, other-其他';

-- ============================================
-- 12. Net Worth Snapshots - 净值快照
-- ============================================
CREATE TABLE net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_assets DECIMAL(15,2) NOT NULL,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  net_worth DECIMAL(15,2) NOT NULL,
  breakdown JSONB,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_net_worth_snapshots_user_id ON net_worth_snapshots(user_id);
CREATE INDEX idx_net_worth_snapshots_date ON net_worth_snapshots(snapshot_date);

COMMENT ON TABLE net_worth_snapshots IS '净值快照表';
COMMENT ON COLUMN net_worth_snapshots.breakdown IS '各类资产明细 JSON';

-- ============================================
-- 13. Reminders - 提醒
-- ============================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('goal', 'budget', 'investment', 'insurance', 'other')),
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at) WHERE is_read = false;

COMMENT ON TABLE reminders IS '提醒表';
COMMENT ON COLUMN reminders.reference_id IS '关联的目标/预算/保单等 ID';

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_accounts_updated_at
  BEFORE UPDATE ON asset_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funds_updated_at
  BEFORE UPDATE ON funds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fund_holdings_updated_at
  BEFORE UPDATE ON fund_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_plans_updated_at
  BEFORE UPDATE ON investment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
