/**
 * Wealth Manager - Database Types
 * TypeScript type definitions matching Supabase schema
 */

// ============================================
// Enums
// ============================================

export type AccountType = 'bank' | 'fund' | 'pension' | 'insurance' | 'other';

export type FundType = 'stock' | 'bond' | 'money' | 'mixed' | 'gold' | 'qdii' | 'other';

export type FundTransactionType = 'buy' | 'sell' | 'dividend' | 'split';

export type InvestmentFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type CashflowType = 'income' | 'expense' | 'transfer';

export type BudgetPeriod = 'monthly' | 'yearly';

export type GoalStatus = 'active' | 'completed' | 'cancelled';

export type InsuranceType = 'life' | 'health' | 'property' | 'auto' | 'other';

export type PremiumFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one_time';

export type ReminderType = 'goal' | 'budget' | 'investment' | 'insurance' | 'other';

// ============================================
// Base Types
// ============================================

export interface Timestamps {
  created_at: string;
  updated_at?: string;
}

// ============================================
// User Profile
// ============================================

export interface UserProfile extends Timestamps {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
}

export interface UserProfileInsert {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  currency?: string;
}

export interface UserProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  currency?: string;
}

// ============================================
// Asset Account
// ============================================

export interface AssetAccount extends Timestamps {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string | null;
  account_number: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface AssetAccountInsert {
  name: string;
  type: AccountType;
  balance?: number;
  institution?: string | null;
  account_number?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface AssetAccountUpdate {
  name?: string;
  type?: AccountType;
  balance?: number;
  institution?: string | null;
  account_number?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

// ============================================
// Fund
// ============================================

export interface Fund extends Timestamps {
  id: string;
  code: string;
  name: string;
  type: FundType | null;
  nav: number | null;
  nav_date: string | null;
}

export interface FundInsert {
  code: string;
  name: string;
  type?: FundType | null;
  nav?: number | null;
  nav_date?: string | null;
}

export interface FundUpdate {
  name?: string;
  type?: FundType | null;
  nav?: number | null;
  nav_date?: string | null;
}

// ============================================
// Fund Holding
// ============================================

export interface FundHolding extends Timestamps {
  id: string;
  user_id: string;
  account_id: string | null;
  fund_id: string;
  shares: number;
  cost_basis: number;
  // Joined fields
  fund?: Fund;
  account?: AssetAccount;
}

export interface FundHoldingInsert {
  account_id?: string | null;
  fund_id: string;
  shares?: number;
  cost_basis?: number;
}

export interface FundHoldingUpdate {
  account_id?: string | null;
  shares?: number;
  cost_basis?: number;
}

// ============================================
// Fund Transaction
// ============================================

export interface FundTransaction {
  id: string;
  user_id: string;
  holding_id: string | null;
  fund_id: string;
  type: FundTransactionType;
  shares: number | null;
  nav: number | null;
  amount: number;
  fee: number;
  transaction_date: string;
  notes: string | null;
  created_at: string;
  // Joined fields
  fund?: Fund;
  holding?: FundHolding;
}

export interface FundTransactionInsert {
  fund_id: string;
  type: FundTransactionType;
  shares?: number | null;
  nav?: number | null;
  amount: number;
  fee?: number;
  transaction_date: string;
  notes?: string | null;
}

export interface FundTransactionUpdate {
  type?: FundTransactionType;
  shares?: number | null;
  nav?: number | null;
  amount?: number;
  fee?: number;
  transaction_date?: string;
  notes?: string | null;
}

// ============================================
// Investment Plan
// ============================================

export interface InvestmentPlan extends Timestamps {
  id: string;
  user_id: string;
  fund_id: string;
  account_id: string | null;
  amount: number;
  frequency: InvestmentFrequency | null;
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean;
  next_date: string | null;
  // Joined fields
  fund?: Fund;
  account?: AssetAccount;
}

export interface InvestmentPlanInsert {
  fund_id: string;
  account_id?: string | null;
  amount: number;
  frequency?: InvestmentFrequency | null;
  day_of_month?: number | null;
  day_of_week?: number | null;
  is_active?: boolean;
  next_date?: string | null;
}

export interface InvestmentPlanUpdate {
  fund_id?: string;
  account_id?: string | null;
  amount?: number;
  frequency?: InvestmentFrequency | null;
  day_of_month?: number | null;
  day_of_week?: number | null;
  is_active?: boolean;
  next_date?: string | null;
}

// ============================================
// Cashflow Category
// ============================================

export interface CashflowCategory {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  is_system: boolean;
  parent_id: string | null;
  created_at: string;
  // Joined fields
  children?: CashflowCategory[];
  parent?: CashflowCategory;
}

export interface CashflowCategoryInsert {
  name: string;
  type: 'income' | 'expense';
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
}

export interface CashflowCategoryUpdate {
  name?: string;
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
}

// ============================================
// Cashflow Transaction
// ============================================

export interface CashflowTransaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  type: CashflowType;
  amount: number;
  description: string | null;
  transaction_date: string;
  tags: string[] | null;
  is_recurring: boolean;
  created_at: string;
  // Joined fields
  category?: CashflowCategory;
  account?: AssetAccount;
}

export interface CashflowTransactionInsert {
  account_id?: string | null;
  category_id?: string | null;
  type: CashflowType;
  amount: number;
  description?: string | null;
  transaction_date: string;
  tags?: string[] | null;
  is_recurring?: boolean;
}

export interface CashflowTransactionUpdate {
  account_id?: string | null;
  category_id?: string | null;
  type?: CashflowType;
  amount?: number;
  description?: string | null;
  transaction_date?: string;
  tags?: string[] | null;
  is_recurring?: boolean;
}

// ============================================
// Budget
// ============================================

export interface Budget extends Timestamps {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod | null;
  start_date: string | null;
  end_date: string | null;
  alert_threshold: number;
  // Joined fields
  category?: CashflowCategory;
}

export interface BudgetInsert {
  category_id?: string | null;
  amount: number;
  period?: BudgetPeriod | null;
  start_date?: string | null;
  end_date?: string | null;
  alert_threshold?: number;
}

export interface BudgetUpdate {
  category_id?: string | null;
  amount?: number;
  period?: BudgetPeriod | null;
  start_date?: string | null;
  end_date?: string | null;
  alert_threshold?: number;
}

// ============================================
// Financial Goal
// ============================================

export interface FinancialGoal extends Timestamps {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  priority: number;
  status: GoalStatus;
  notes: string | null;
}

export interface FinancialGoalInsert {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
  category?: string | null;
  priority?: number;
  status?: GoalStatus;
  notes?: string | null;
}

export interface FinancialGoalUpdate {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  category?: string | null;
  priority?: number;
  status?: GoalStatus;
  notes?: string | null;
}

// ============================================
// Insurance Policy
// ============================================

export interface InsurancePolicy extends Timestamps {
  id: string;
  user_id: string;
  name: string;
  type: InsuranceType | null;
  provider: string | null;
  policy_number: string | null;
  premium: number | null;
  premium_frequency: PremiumFrequency | null;
  coverage_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  beneficiary: string | null;
  notes: string | null;
}

export interface InsurancePolicyInsert {
  name: string;
  type?: InsuranceType | null;
  provider?: string | null;
  policy_number?: string | null;
  premium?: number | null;
  premium_frequency?: PremiumFrequency | null;
  coverage_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  beneficiary?: string | null;
  notes?: string | null;
}

export interface InsurancePolicyUpdate {
  name?: string;
  type?: InsuranceType | null;
  provider?: string | null;
  policy_number?: string | null;
  premium?: number | null;
  premium_frequency?: PremiumFrequency | null;
  coverage_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  beneficiary?: string | null;
  notes?: string | null;
}

// ============================================
// Net Worth Snapshot
// ============================================

export interface NetWorthBreakdown {
  bank: number;
  fund: number;
  pension: number;
  insurance: number;
  other: number;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  breakdown: NetWorthBreakdown | null;
  snapshot_date: string;
  created_at: string;
}

// ============================================
// Reminder
// ============================================

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  remind_at: string;
  type: ReminderType | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ReminderInsert {
  title: string;
  description?: string | null;
  remind_at: string;
  type?: ReminderType | null;
  reference_id?: string | null;
}

export interface ReminderUpdate {
  title?: string;
  description?: string | null;
  remind_at?: string;
  type?: ReminderType | null;
  reference_id?: string | null;
  is_read?: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface MonthlyCashflowSummary {
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  income_by_category: Record<string, number>;
  expense_by_category: Record<string, number>;
}

export interface BudgetStatus {
  budget_id: string;
  category_name: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  usage_percentage: number;
  is_over_budget: boolean;
  is_warning: boolean;
}

export interface FundReturn {
  holding_id: string;
  fund_code: string;
  fund_name: string;
  shares: number;
  cost_basis: number;
  current_value: number;
  profit_loss: number;
  return_rate: number;
}

export interface GoalProgress {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  deadline: string | null;
  days_remaining: number | null;
  monthly_required: number | null;
}

export interface CashflowTrend {
  year_month: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
}

export interface UpcomingReminder {
  reminder_id: string;
  title: string;
  description: string | null;
  remind_at: string;
  type: ReminderType | null;
  days_until: number;
}

// ============================================
// Supabase Database Types (for type safety)
// ============================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      asset_accounts: {
        Row: AssetAccount;
        Insert: AssetAccountInsert;
        Update: AssetAccountUpdate;
      };
      funds: {
        Row: Fund;
        Insert: FundInsert;
        Update: FundUpdate;
      };
      fund_holdings: {
        Row: FundHolding;
        Insert: FundHoldingInsert;
        Update: FundHoldingUpdate;
      };
      fund_transactions: {
        Row: FundTransaction;
        Insert: FundTransactionInsert;
        Update: FundTransactionUpdate;
      };
      investment_plans: {
        Row: InvestmentPlan;
        Insert: InvestmentPlanInsert;
        Update: InvestmentPlanUpdate;
      };
      cashflow_categories: {
        Row: CashflowCategory;
        Insert: CashflowCategoryInsert;
        Update: CashflowCategoryUpdate;
      };
      cashflow_transactions: {
        Row: CashflowTransaction;
        Insert: CashflowTransactionInsert;
        Update: CashflowTransactionUpdate;
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };
      financial_goals: {
        Row: FinancialGoal;
        Insert: FinancialGoalInsert;
        Update: FinancialGoalUpdate;
      };
      insurance_policies: {
        Row: InsurancePolicy;
        Insert: InsurancePolicyInsert;
        Update: InsurancePolicyUpdate;
      };
      net_worth_snapshots: {
        Row: NetWorthSnapshot;
      };
      reminders: {
        Row: Reminder;
        Insert: ReminderInsert;
        Update: ReminderUpdate;
      };
    };
    Functions: {
      calculate_user_net_worth: {
        Args: { p_user_id: string };
        Returns: {
          total_assets: number;
          total_liabilities: number;
          net_worth: number;
          breakdown: NetWorthBreakdown;
        }[];
      };
      get_monthly_cashflow_summary: {
        Args: { p_user_id: string; p_year: number; p_month: number };
        Returns: MonthlyCashflowSummary[];
      };
      get_budget_status: {
        Args: { p_user_id: string; p_year: number; p_month: number };
        Returns: BudgetStatus[];
      };
      calculate_fund_returns: {
        Args: { p_user_id: string };
        Returns: FundReturn[];
      };
      create_net_worth_snapshot: {
        Args: { p_user_id: string };
        Returns: string;
      };
      get_goal_progress: {
        Args: { p_user_id: string };
        Returns: GoalProgress[];
      };
      get_upcoming_reminders: {
        Args: { p_user_id: string; p_days?: number };
        Returns: UpcomingReminder[];
      };
      get_cashflow_trend: {
        Args: { p_user_id: string; p_months?: number };
        Returns: CashflowTrend[];
      };
    };
  };
}
