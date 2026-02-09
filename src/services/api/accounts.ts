/**
 * Wealth Manager - Accounts API Service
 * Asset accounts management API functions
 */

import { supabase, requireAuth } from '@/lib/supabase';
import type {
  AssetAccount,
  AssetAccountInsert,
  AssetAccountUpdate,
  AccountType,
} from '@/types/database';

export interface AccountFilters {
  type?: AccountType;
  isActive?: boolean;
}

export const accountsApi = {
  /**
   * Get all accounts for current user
   */
  async getAccounts(filters?: AccountFilters): Promise<AssetAccount[]> {
    await requireAuth();

    let query = supabase
      .from('asset_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<AssetAccount> {
    await requireAuth();

    const { data, error } = await supabase
      .from('asset_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new account
   */
  async createAccount(account: AssetAccountInsert): Promise<AssetAccount> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('asset_accounts')
      .insert({ ...account, user_id: userId } as never)
      .select()
      .single();

    if (error) throw error;
    return data as AssetAccount;
  },

  /**
   * Update account
   */
  async updateAccount(id: string, updates: AssetAccountUpdate): Promise<AssetAccount> {
    await requireAuth();

    const { data, error } = await supabase
      .from('asset_accounts')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AssetAccount;
  },

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('asset_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get total balance by account type
   */
  async getBalanceByType(): Promise<Record<AccountType, number>> {
    const accounts = await this.getAccounts({ isActive: true });

    const balances: Record<AccountType, number> = {
      bank: 0,
      fund: 0,
      pension: 0,
      insurance: 0,
      other: 0,
    };

    accounts.forEach((account) => {
      balances[account.type] += account.balance;
    });

    return balances;
  },

  /**
   * Get total balance
   */
  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAccounts({ isActive: true });
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  },
};

export default accountsApi;
