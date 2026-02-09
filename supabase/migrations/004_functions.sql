-- ============================================
-- Wealth Manager Database Functions
-- Migration: 004_functions.sql
-- Description: Utility functions for financial calculations
-- ============================================

-- ============================================
-- 1. Calculate User Net Worth - 计算用户净值
-- ============================================
CREATE OR REPLACE FUNCTION calculate_user_net_worth(p_user_id UUID)
RETURNS TABLE (
  total_assets DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  breakdown JSONB
) AS $$
DECLARE
  v_bank_balance DECIMAL(15,2) := 0;
  v_fund_value DECIMAL(15,2) := 0;
  v_pension_balance DECIMAL(15,2) := 0;
  v_insurance_value DECIMAL(15,2) := 0;
  v_other_balance DECIMAL(15,2) := 0;
  v_total_assets DECIMAL(15,2) := 0;
  v_total_liabilities DECIMAL(15,2) := 0;
BEGIN
  -- Calculate bank account balances
  SELECT COALESCE(SUM(balance), 0) INTO v_bank_balance
  FROM asset_accounts
  WHERE user_id = p_user_id AND type = 'bank' AND is_active = true;

  -- Calculate fund holdings value
  SELECT COALESCE(SUM(fh.shares * COALESCE(f.nav, 1)), 0) INTO v_fund_value
  FROM fund_holdings fh
  JOIN funds f ON fh.fund_id = f.id
  WHERE fh.user_id = p_user_id;

  -- Calculate pension balances
  SELECT COALESCE(SUM(balance), 0) INTO v_pension_balance
  FROM asset_accounts
  WHERE user_id = p_user_id AND type = 'pension' AND is_active = true;

  -- Calculate insurance account balances
  SELECT COALESCE(SUM(balance), 0) INTO v_insurance_value
  FROM asset_accounts
  WHERE user_id = p_user_id AND type = 'insurance' AND is_active = true;

  -- Calculate other account balances
  SELECT COALESCE(SUM(balance), 0) INTO v_other_balance
  FROM asset_accounts
  WHERE user_id = p_user_id AND type = 'other' AND is_active = true;

  -- Calculate total assets
  v_total_assets := v_bank_balance + v_fund_value + v_pension_balance + v_insurance_value + v_other_balance;

  -- Return result
  RETURN QUERY SELECT
    v_total_assets,
    v_total_liabilities,
    v_total_assets - v_total_liabilities,
    jsonb_build_object(
      'bank', v_bank_balance,
      'fund', v_fund_value,
      'pension', v_pension_balance,
      'insurance', v_insurance_value,
      'other', v_other_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Get Monthly Cashflow Summary - 获取月度收支汇总
-- ============================================
CREATE OR REPLACE FUNCTION get_monthly_cashflow_summary(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  total_income DECIMAL(15,2),
  total_expense DECIMAL(15,2),
  net_cashflow DECIMAL(15,2),
  income_by_category JSONB,
  expense_by_category JSONB
) AS $$
DECLARE
  v_total_income DECIMAL(15,2) := 0;
  v_total_expense DECIMAL(15,2) := 0;
  v_income_breakdown JSONB;
  v_expense_breakdown JSONB;
BEGIN
  -- Calculate total income
  SELECT COALESCE(SUM(amount), 0) INTO v_total_income
  FROM cashflow_transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND EXTRACT(YEAR FROM transaction_date) = p_year
    AND EXTRACT(MONTH FROM transaction_date) = p_month;

  -- Calculate total expense
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
  FROM cashflow_transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND EXTRACT(YEAR FROM transaction_date) = p_year
    AND EXTRACT(MONTH FROM transaction_date) = p_month;

  -- Get income breakdown by category
  SELECT COALESCE(jsonb_object_agg(category_name, category_total), '{}'::jsonb)
  INTO v_income_breakdown
  FROM (
    SELECT cc.name AS category_name, SUM(ct.amount) AS category_total
    FROM cashflow_transactions ct
    LEFT JOIN cashflow_categories cc ON ct.category_id = cc.id
    WHERE ct.user_id = p_user_id
      AND ct.type = 'income'
      AND EXTRACT(YEAR FROM ct.transaction_date) = p_year
      AND EXTRACT(MONTH FROM ct.transaction_date) = p_month
    GROUP BY cc.name
  ) sub;

  -- Get expense breakdown by category
  SELECT COALESCE(jsonb_object_agg(category_name, category_total), '{}'::jsonb)
  INTO v_expense_breakdown
  FROM (
    SELECT cc.name AS category_name, SUM(ct.amount) AS category_total
    FROM cashflow_transactions ct
    LEFT JOIN cashflow_categories cc ON ct.category_id = cc.id
    WHERE ct.user_id = p_user_id
      AND ct.type = 'expense'
      AND EXTRACT(YEAR FROM ct.transaction_date) = p_year
      AND EXTRACT(MONTH FROM ct.transaction_date) = p_month
    GROUP BY cc.name
  ) sub;

  RETURN QUERY SELECT
    v_total_income,
    v_total_expense,
    v_total_income - v_total_expense,
    v_income_breakdown,
    v_expense_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Get Budget Status - 获取预算执行状态
-- ============================================
CREATE OR REPLACE FUNCTION get_budget_status(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  budget_id UUID,
  category_name TEXT,
  budget_amount DECIMAL(15,2),
  spent_amount DECIMAL(15,2),
  remaining_amount DECIMAL(15,2),
  usage_percentage DECIMAL(5,2),
  is_over_budget BOOLEAN,
  is_warning BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id AS budget_id,
    cc.name AS category_name,
    b.amount AS budget_amount,
    COALESCE(SUM(ct.amount), 0) AS spent_amount,
    b.amount - COALESCE(SUM(ct.amount), 0) AS remaining_amount,
    CASE
      WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(ct.amount), 0) / b.amount) * 100, 2)
      ELSE 0
    END AS usage_percentage,
    COALESCE(SUM(ct.amount), 0) > b.amount AS is_over_budget,
    COALESCE(SUM(ct.amount), 0) >= b.amount * b.alert_threshold AS is_warning
  FROM budgets b
  LEFT JOIN cashflow_categories cc ON b.category_id = cc.id
  LEFT JOIN cashflow_transactions ct ON ct.category_id = b.category_id
    AND ct.user_id = b.user_id
    AND ct.type = 'expense'
    AND EXTRACT(YEAR FROM ct.transaction_date) = p_year
    AND EXTRACT(MONTH FROM ct.transaction_date) = p_month
  WHERE b.user_id = p_user_id
    AND b.period = 'monthly'
  GROUP BY b.id, cc.name, b.amount, b.alert_threshold;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Calculate Fund Holding Returns - 计算基金持仓收益
-- ============================================
CREATE OR REPLACE FUNCTION calculate_fund_returns(p_user_id UUID)
RETURNS TABLE (
  holding_id UUID,
  fund_code TEXT,
  fund_name TEXT,
  shares DECIMAL(15,4),
  cost_basis DECIMAL(15,2),
  current_value DECIMAL(15,2),
  profit_loss DECIMAL(15,2),
  return_rate DECIMAL(8,4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fh.id AS holding_id,
    f.code AS fund_code,
    f.name AS fund_name,
    fh.shares,
    fh.cost_basis,
    ROUND(fh.shares * COALESCE(f.nav, 1), 2) AS current_value,
    ROUND(fh.shares * COALESCE(f.nav, 1) - fh.cost_basis, 2) AS profit_loss,
    CASE
      WHEN fh.cost_basis > 0 THEN
        ROUND((fh.shares * COALESCE(f.nav, 1) - fh.cost_basis) / fh.cost_basis, 4)
      ELSE 0
    END AS return_rate
  FROM fund_holdings fh
  JOIN funds f ON fh.fund_id = f.id
  WHERE fh.user_id = p_user_id
    AND fh.shares > 0
  ORDER BY current_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Create Net Worth Snapshot - 创建净值快照
-- ============================================
CREATE OR REPLACE FUNCTION create_net_worth_snapshot(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_total_assets DECIMAL(15,2);
  v_total_liabilities DECIMAL(15,2);
  v_net_worth DECIMAL(15,2);
  v_breakdown JSONB;
BEGIN
  -- Get current net worth
  SELECT total_assets, total_liabilities, net_worth, breakdown
  INTO v_total_assets, v_total_liabilities, v_net_worth, v_breakdown
  FROM calculate_user_net_worth(p_user_id);

  -- Insert or update snapshot for today
  INSERT INTO net_worth_snapshots (user_id, total_assets, total_liabilities, net_worth, breakdown, snapshot_date)
  VALUES (p_user_id, v_total_assets, v_total_liabilities, v_net_worth, v_breakdown, CURRENT_DATE)
  ON CONFLICT (user_id, snapshot_date)
  DO UPDATE SET
    total_assets = EXCLUDED.total_assets,
    total_liabilities = EXCLUDED.total_liabilities,
    net_worth = EXCLUDED.net_worth,
    breakdown = EXCLUDED.breakdown
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Get Goal Progress - 获取目标进度
-- ============================================
CREATE OR REPLACE FUNCTION get_goal_progress(p_user_id UUID)
RETURNS TABLE (
  goal_id UUID,
  goal_name TEXT,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2),
  progress_percentage DECIMAL(5,2),
  deadline DATE,
  days_remaining INTEGER,
  monthly_required DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fg.id AS goal_id,
    fg.name AS goal_name,
    fg.target_amount,
    fg.current_amount,
    CASE
      WHEN fg.target_amount > 0 THEN ROUND((fg.current_amount / fg.target_amount) * 100, 2)
      ELSE 0
    END AS progress_percentage,
    fg.deadline,
    CASE
      WHEN fg.deadline IS NOT NULL THEN (fg.deadline - CURRENT_DATE)::INTEGER
      ELSE NULL
    END AS days_remaining,
    CASE
      WHEN fg.deadline IS NOT NULL AND fg.deadline > CURRENT_DATE THEN
        ROUND((fg.target_amount - fg.current_amount) / GREATEST(((fg.deadline - CURRENT_DATE)::DECIMAL / 30), 1), 2)
      ELSE NULL
    END AS monthly_required
  FROM financial_goals fg
  WHERE fg.user_id = p_user_id
    AND fg.status = 'active'
  ORDER BY fg.priority ASC, fg.deadline ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Update Fund Holding After Transaction - 交易后更新持仓
-- ============================================
CREATE OR REPLACE FUNCTION update_holding_after_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_holding_id UUID;
BEGIN
  -- Find or create holding
  SELECT id INTO v_holding_id
  FROM fund_holdings
  WHERE user_id = NEW.user_id
    AND fund_id = NEW.fund_id
    AND COALESCE(account_id, '00000000-0000-0000-0000-000000000000') =
        COALESCE((SELECT account_id FROM fund_holdings WHERE id = NEW.holding_id), '00000000-0000-0000-0000-000000000000');

  IF v_holding_id IS NULL AND NEW.type = 'buy' THEN
    -- Create new holding
    INSERT INTO fund_holdings (user_id, fund_id, shares, cost_basis)
    VALUES (NEW.user_id, NEW.fund_id, NEW.shares, NEW.amount)
    RETURNING id INTO v_holding_id;

    -- Update transaction with holding_id
    NEW.holding_id := v_holding_id;
  ELSIF v_holding_id IS NOT NULL THEN
    -- Update existing holding
    IF NEW.type = 'buy' THEN
      UPDATE fund_holdings
      SET shares = shares + NEW.shares,
          cost_basis = cost_basis + NEW.amount,
          updated_at = NOW()
      WHERE id = v_holding_id;
    ELSIF NEW.type = 'sell' THEN
      UPDATE fund_holdings
      SET shares = shares - NEW.shares,
          cost_basis = GREATEST(cost_basis - (cost_basis * (NEW.shares / NULLIF(shares, 0))), 0),
          updated_at = NOW()
      WHERE id = v_holding_id;
    ELSIF NEW.type = 'dividend' THEN
      -- Dividend reinvestment
      UPDATE fund_holdings
      SET shares = shares + COALESCE(NEW.shares, 0),
          updated_at = NOW()
      WHERE id = v_holding_id;
    END IF;

    NEW.holding_id := v_holding_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_holding_after_transaction
  BEFORE INSERT ON fund_transactions
  FOR EACH ROW EXECUTE FUNCTION update_holding_after_transaction();

-- ============================================
-- 8. Get Upcoming Reminders - 获取即将到来的提醒
-- ============================================
CREATE OR REPLACE FUNCTION get_upcoming_reminders(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  reminder_id UUID,
  title TEXT,
  description TEXT,
  remind_at TIMESTAMPTZ,
  type TEXT,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS reminder_id,
    r.title,
    r.description,
    r.remind_at,
    r.type,
    EXTRACT(DAY FROM (r.remind_at - NOW()))::INTEGER AS days_until
  FROM reminders r
  WHERE r.user_id = p_user_id
    AND r.is_read = false
    AND r.remind_at <= NOW() + (p_days || ' days')::INTERVAL
    AND r.remind_at >= NOW()
  ORDER BY r.remind_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Get Cashflow Trend - 获取收支趋势
-- ============================================
CREATE OR REPLACE FUNCTION get_cashflow_trend(
  p_user_id UUID,
  p_months INTEGER DEFAULT 12
)
RETURNS TABLE (
  year_month TEXT,
  total_income DECIMAL(15,2),
  total_expense DECIMAL(15,2),
  net_cashflow DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', ct.transaction_date), 'YYYY-MM') AS year_month,
    COALESCE(SUM(CASE WHEN ct.type = 'income' THEN ct.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN ct.type = 'expense' THEN ct.amount ELSE 0 END), 0) AS total_expense,
    COALESCE(SUM(CASE WHEN ct.type = 'income' THEN ct.amount ELSE -ct.amount END), 0) AS net_cashflow
  FROM cashflow_transactions ct
  WHERE ct.user_id = p_user_id
    AND ct.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months || ' months')::INTERVAL
    AND ct.type IN ('income', 'expense')
  GROUP BY DATE_TRUNC('month', ct.transaction_date)
  ORDER BY year_month ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Auto-create User Profile - 自动创建用户资料
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
