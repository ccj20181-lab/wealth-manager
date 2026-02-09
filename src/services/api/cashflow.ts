/**
 * Wealth Manager - Cashflow API Service
 * Cashflow transactions, categories, and budgets API functions
 */

import { supabase, requireAuth } from '@/lib/supabase';
import type {
  CashflowCategory,
  CashflowCategoryInsert,
  CashflowTransaction,
  CashflowTransactionInsert,
  CashflowTransactionUpdate,
  Budget,
  BudgetInsert,
  BudgetUpdate,
  MonthlyCashflowSummary,
  BudgetStatus,
  CashflowTrend,
} from '@/types/database';

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export const cashflowApi = {
  // ============================================
  // Categories
  // ============================================

  /**
   * Get all categories (system + user's custom)
   */
  async getCategories(): Promise<CashflowCategory[]> {
    const { data, error } = await supabase
      .from('cashflow_categories')
      .select('*')
      .order('is_system', { ascending: false })
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Get categories by type
   */
  async getCategoriesByType(type: 'income' | 'expense'): Promise<CashflowCategory[]> {
    const { data, error } = await supabase
      .from('cashflow_categories')
      .select('*')
      .eq('type', type)
      .order('is_system', { ascending: false })
      .order('name');

    if (error) throw error;
    return data;
  },

  /**
   * Get categories with hierarchy
   */
  async getCategoriesTree(): Promise<CashflowCategory[]> {
    const categories = await this.getCategories();

    // Build tree structure
    const rootCategories = categories.filter((c) => !c.parent_id);
    const childMap = new Map<string, CashflowCategory[]>();

    categories.forEach((c) => {
      if (c.parent_id) {
        const children = childMap.get(c.parent_id) || [];
        children.push(c);
        childMap.set(c.parent_id, children);
      }
    });

    return rootCategories.map((c) => ({
      ...c,
      children: childMap.get(c.id) || [],
    }));
  },

  /**
   * Create custom category
   */
  async createCategory(category: CashflowCategoryInsert): Promise<CashflowCategory> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('cashflow_categories')
      .insert({ ...category, user_id: userId, is_system: false } as never)
      .select()
      .single();

    if (error) throw error;
    return data as CashflowCategory;
  },

  /**
   * Delete custom category
   */
  async deleteCategory(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('cashflow_categories')
      .delete()
      .eq('id', id)
      .eq('is_system', false);

    if (error) throw error;
  },

  // ============================================
  // Transactions
  // ============================================

  /**
   * Get transactions with filters
   */
  async getTransactions(filters?: TransactionFilters): Promise<CashflowTransaction[]> {
    await requireAuth();

    let query = supabase
      .from('cashflow_transactions')
      .select(`
        *,
        category:cashflow_categories(*),
        account:asset_accounts(*)
      `)
      .order('transaction_date', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 10): Promise<CashflowTransaction[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('cashflow_transactions')
      .select(`
        *,
        category:cashflow_categories(*),
        account:asset_accounts(*)
      `)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Create transaction
   */
  async createTransaction(transaction: CashflowTransactionInsert): Promise<CashflowTransaction> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('cashflow_transactions')
      .insert({ ...transaction, user_id: userId } as never)
      .select(`
        *,
        category:cashflow_categories(*)
      `)
      .single();

    if (error) throw error;
    return data as CashflowTransaction;
  },

  /**
   * Update transaction
   */
  async updateTransaction(
    id: string,
    updates: CashflowTransactionUpdate
  ): Promise<CashflowTransaction> {
    await requireAuth();

    const { data, error } = await supabase
      .from('cashflow_transactions')
      .update(updates as never)
      .eq('id', id)
      .select(`
        *,
        category:cashflow_categories(*)
      `)
      .single();

    if (error) throw error;
    return data as CashflowTransaction;
  },

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('cashflow_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get monthly cashflow summary
   */
  async getMonthlySummary(year: number, month: number): Promise<MonthlyCashflowSummary> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('get_monthly_cashflow_summary', {
        p_user_id: userId,
        p_year: year,
        p_month: month,
      } as never);

    if (error) throw error;
    const result = data as MonthlyCashflowSummary[] | null;
    return result?.[0] || {
      total_income: 0,
      total_expense: 0,
      net_cashflow: 0,
      income_by_category: {},
      expense_by_category: {},
    };
  },

  /**
   * Get cashflow trend
   */
  async getCashflowTrend(months = 12): Promise<CashflowTrend[]> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('get_cashflow_trend', {
        p_user_id: userId,
        p_months: months,
      } as never);

    if (error) throw error;
    return data as CashflowTrend[];
  },

  // ============================================
  // Budgets
  // ============================================

  /**
   * Get all budgets
   */
  async getBudgets(): Promise<Budget[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:cashflow_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get budget status for current month
   */
  async getBudgetStatus(year: number, month: number): Promise<BudgetStatus[]> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('get_budget_status', {
        p_user_id: userId,
        p_year: year,
        p_month: month,
      } as never);

    if (error) throw error;
    return data as BudgetStatus[];
  },

  /**
   * Create budget
   */
  async createBudget(budget: BudgetInsert): Promise<Budget> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: userId } as never)
      .select(`
        *,
        category:cashflow_categories(*)
      `)
      .single();

    if (error) throw error;
    return data as Budget;
  },

  /**
   * Update budget
   */
  async updateBudget(id: string, updates: BudgetUpdate): Promise<Budget> {
    await requireAuth();

    const { data, error } = await supabase
      .from('budgets')
      .update(updates as never)
      .eq('id', id)
      .select(`
        *,
        category:cashflow_categories(*)
      `)
      .single();

    if (error) throw error;
    return data as Budget;
  },

  /**
   * Delete budget
   */
  async deleteBudget(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export default cashflowApi;
