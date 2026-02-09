/**
 * Wealth Manager - Funds API Service
 * Fund holdings, transactions, and investment plans API functions
 */

import { supabase, requireAuth } from '@/lib/supabase';
import type {
  Fund,
  FundHolding,
  FundTransaction,
  FundTransactionInsert,
  InvestmentPlan,
  InvestmentPlanInsert,
  InvestmentPlanUpdate,
  FundReturn,
} from '@/types/database';

export interface TransactionFilters {
  fundId?: string;
  type?: 'buy' | 'sell' | 'dividend' | 'split';
  startDate?: string;
  endDate?: string;
}

export const fundsApi = {
  // ============================================
  // Funds
  // ============================================

  /**
   * Search funds by code or name
   */
  async searchFunds(keyword: string): Promise<Fund[]> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .or(`code.ilike.%${keyword}%,name.ilike.%${keyword}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Get fund by code
   */
  async getFundByCode(code: string): Promise<Fund | null> {
    const { data, error } = await supabase
      .from('funds')
      .select('*')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // ============================================
  // Holdings
  // ============================================

  /**
   * Get all fund holdings for current user
   */
  async getHoldings(): Promise<FundHolding[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('fund_holdings')
      .select(`
        *,
        fund:funds(*),
        account:asset_accounts(*)
      `)
      .gt('shares', 0)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get fund returns for current user
   */
  async getFundReturns(): Promise<FundReturn[]> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('calculate_fund_returns', { p_user_id: userId } as never);

    if (error) throw error;
    return data as FundReturn[];
  },

  /**
   * Get total fund value
   */
  async getTotalFundValue(): Promise<number> {
    const returns = await this.getFundReturns();
    return returns.reduce((sum, r) => sum + r.current_value, 0);
  },

  // ============================================
  // Transactions
  // ============================================

  /**
   * Get fund transactions
   */
  async getTransactions(filters?: TransactionFilters): Promise<FundTransaction[]> {
    await requireAuth();

    let query = supabase
      .from('fund_transactions')
      .select(`
        *,
        fund:funds(*)
      `)
      .order('transaction_date', { ascending: false });

    if (filters?.fundId) {
      query = query.eq('fund_id', filters.fundId);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create fund transaction (buy/sell/dividend)
   */
  async createTransaction(transaction: FundTransactionInsert): Promise<FundTransaction> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('fund_transactions')
      .insert({ ...transaction, user_id: userId } as never)
      .select(`
        *,
        fund:funds(*)
      `)
      .single();

    if (error) throw error;
    return data as FundTransaction;
  },

  /**
   * Delete fund transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('fund_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // Investment Plans
  // ============================================

  /**
   * Get all investment plans
   */
  async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('investment_plans')
      .select(`
        *,
        fund:funds(*),
        account:asset_accounts(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active investment plans
   */
  async getActiveInvestmentPlans(): Promise<InvestmentPlan[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('investment_plans')
      .select(`
        *,
        fund:funds(*),
        account:asset_accounts(*)
      `)
      .eq('is_active', true)
      .order('next_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create investment plan
   */
  async createInvestmentPlan(plan: InvestmentPlanInsert): Promise<InvestmentPlan> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('investment_plans')
      .insert({ ...plan, user_id: userId } as never)
      .select(`
        *,
        fund:funds(*)
      `)
      .single();

    if (error) throw error;
    return data as InvestmentPlan;
  },

  /**
   * Update investment plan
   */
  async updateInvestmentPlan(id: string, updates: InvestmentPlanUpdate): Promise<InvestmentPlan> {
    await requireAuth();

    const { data, error } = await supabase
      .from('investment_plans')
      .update(updates as never)
      .eq('id', id)
      .select(`
        *,
        fund:funds(*)
      `)
      .single();

    if (error) throw error;
    return data as InvestmentPlan;
  },

  /**
   * Delete investment plan
   */
  async deleteInvestmentPlan(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('investment_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle investment plan active status
   */
  async toggleInvestmentPlanActive(id: string, isActive: boolean): Promise<InvestmentPlan> {
    return this.updateInvestmentPlan(id, { is_active: isActive });
  },
};

export default fundsApi;
