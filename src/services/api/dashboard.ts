/**
 * Wealth Manager - Dashboard API Service
 * Net worth, summary statistics, and dashboard data API functions
 */

import { supabase, requireAuth } from '@/lib/supabase';
import type {
  NetWorthSnapshot,
  NetWorthBreakdown,
} from '@/types/database';
import { accountsApi } from './accounts';
import { fundsApi } from './funds';
import { cashflowApi } from './cashflow';
import { goalsApi } from './goals';

export interface DashboardSummary {
  netWorth: {
    total: number;
    assets: number;
    liabilities: number;
    breakdown: NetWorthBreakdown;
  };
  cashflow: {
    monthlyIncome: number;
    monthlyExpense: number;
    netCashflow: number;
  };
  goals: {
    activeCount: number;
    completedCount: number;
    nearestDeadline: string | null;
  };
  investments: {
    totalValue: number;
    totalReturn: number;
    returnRate: number;
  };
}

export const dashboardApi = {
  // ============================================
  // Net Worth
  // ============================================

  /**
   * Calculate current net worth
   */
  async calculateNetWorth(): Promise<{
    total_assets: number;
    total_liabilities: number;
    net_worth: number;
    breakdown: NetWorthBreakdown;
  }> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('calculate_user_net_worth', { p_user_id: userId } as never);

    if (error) throw error;
    const result = data as Array<{
      total_assets: number;
      total_liabilities: number;
      net_worth: number;
      breakdown: NetWorthBreakdown;
    }> | null;
    return result?.[0] || {
      total_assets: 0,
      total_liabilities: 0,
      net_worth: 0,
      breakdown: { bank: 0, fund: 0, pension: 0, insurance: 0, other: 0 },
    };
  },

  /**
   * Create net worth snapshot
   */
  async createSnapshot(): Promise<string> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('create_net_worth_snapshot', { p_user_id: userId } as never);

    if (error) throw error;
    return data as string;
  },

  /**
   * Get net worth history
   */
  async getNetWorthHistory(months = 12): Promise<NetWorthSnapshot[]> {
    await requireAuth();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get latest net worth snapshot
   */
  async getLatestSnapshot(): Promise<NetWorthSnapshot | null> {
    await requireAuth();

    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // ============================================
  // Dashboard Summary
  // ============================================

  /**
   * Get comprehensive dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch all data in parallel
    const [
      netWorthData,
      cashflowSummary,
      goals,
      fundReturns,
    ] = await Promise.all([
      this.calculateNetWorth(),
      cashflowApi.getMonthlySummary(year, month),
      goalsApi.getGoals(),
      fundsApi.getFundReturns(),
    ]);

    // Calculate investment stats
    const totalValue = fundReturns.reduce((sum, r) => sum + r.current_value, 0);
    const totalCost = fundReturns.reduce((sum, r) => sum + r.cost_basis, 0);
    const totalReturn = fundReturns.reduce((sum, r) => sum + r.profit_loss, 0);
    const returnRate = totalCost > 0 ? totalReturn / totalCost : 0;

    // Calculate goal stats
    const activeGoals = goals.filter((g) => g.status === 'active');
    const completedGoals = goals.filter((g) => g.status === 'completed');
    const nearestDeadline = activeGoals
      .filter((g) => g.deadline)
      .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))[0]?.deadline || null;

    return {
      netWorth: {
        total: netWorthData.net_worth,
        assets: netWorthData.total_assets,
        liabilities: netWorthData.total_liabilities,
        breakdown: netWorthData.breakdown,
      },
      cashflow: {
        monthlyIncome: cashflowSummary.total_income,
        monthlyExpense: cashflowSummary.total_expense,
        netCashflow: cashflowSummary.net_cashflow,
      },
      goals: {
        activeCount: activeGoals.length,
        completedCount: completedGoals.length,
        nearestDeadline,
      },
      investments: {
        totalValue,
        totalReturn,
        returnRate,
      },
    };
  },

  // ============================================
  // Quick Stats
  // ============================================

  /**
   * Get quick stats for dashboard cards
   */
  async getQuickStats() {
    const [
      totalBalance,
      balanceByType,
      fundValue,
      upcomingReminders,
    ] = await Promise.all([
      accountsApi.getTotalBalance(),
      accountsApi.getBalanceByType(),
      fundsApi.getTotalFundValue(),
      goalsApi.getUpcomingReminders(7),
    ]);

    return {
      totalBalance,
      balanceByType,
      fundValue,
      upcomingRemindersCount: upcomingReminders.length,
    };
  },

  // ============================================
  // Asset Allocation
  // ============================================

  /**
   * Get asset allocation data
   */
  async getAssetAllocation() {
    const netWorth = await this.calculateNetWorth();
    const total = netWorth.total_assets;

    if (total === 0) {
      return {
        breakdown: netWorth.breakdown,
        percentages: {
          bank: 0,
          fund: 0,
          pension: 0,
          insurance: 0,
          other: 0,
        },
      };
    }

    return {
      breakdown: netWorth.breakdown,
      percentages: {
        bank: (netWorth.breakdown.bank / total) * 100,
        fund: (netWorth.breakdown.fund / total) * 100,
        pension: (netWorth.breakdown.pension / total) * 100,
        insurance: (netWorth.breakdown.insurance / total) * 100,
        other: (netWorth.breakdown.other / total) * 100,
      },
    };
  },
};

export default dashboardApi;
