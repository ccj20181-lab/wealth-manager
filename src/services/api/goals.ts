/**
 * Wealth Manager - Goals API Service
 * Financial goals, insurance policies, and reminders API functions
 */

import { supabase, requireAuth } from '@/lib/supabase';
import type {
  FinancialGoal,
  FinancialGoalInsert,
  FinancialGoalUpdate,
  InsurancePolicy,
  InsurancePolicyInsert,
  InsurancePolicyUpdate,
  Reminder,
  ReminderInsert,
  ReminderUpdate,
  GoalProgress,
  UpcomingReminder,
} from '@/types/database';

export const goalsApi = {
  // ============================================
  // Financial Goals
  // ============================================

  /**
   * Get all financial goals
   */
  async getGoals(): Promise<FinancialGoal[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('priority', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active goals
   */
  async getActiveGoals(): Promise<FinancialGoal[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get goal progress
   */
  async getGoalProgress(): Promise<GoalProgress[]> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('get_goal_progress', { p_user_id: userId } as never);

    if (error) throw error;
    return data as GoalProgress[];
  },

  /**
   * Get goal by ID
   */
  async getGoal(id: string): Promise<FinancialGoal> {
    await requireAuth();

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create financial goal
   */
  async createGoal(goal: FinancialGoalInsert): Promise<FinancialGoal> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({ ...goal, user_id: userId } as never)
      .select()
      .single();

    if (error) throw error;
    return data as FinancialGoal;
  },

  /**
   * Update financial goal
   */
  async updateGoal(id: string, updates: FinancialGoalUpdate): Promise<FinancialGoal> {
    await requireAuth();

    const { data, error } = await supabase
      .from('financial_goals')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FinancialGoal;
  },

  /**
   * Delete financial goal
   */
  async deleteGoal(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Update goal progress
   */
  async updateGoalProgress(id: string, currentAmount: number): Promise<FinancialGoal> {
    return this.updateGoal(id, { current_amount: currentAmount });
  },

  /**
   * Complete goal
   */
  async completeGoal(id: string): Promise<FinancialGoal> {
    return this.updateGoal(id, { status: 'completed' });
  },

  // ============================================
  // Insurance Policies
  // ============================================

  /**
   * Get all insurance policies
   */
  async getInsurancePolicies(): Promise<InsurancePolicy[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('end_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active insurance policies
   */
  async getActiveInsurancePolicies(): Promise<InsurancePolicy[]> {
    await requireAuth();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('end_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get insurance policy by ID
   */
  async getInsurancePolicy(id: string): Promise<InsurancePolicy> {
    await requireAuth();

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create insurance policy
   */
  async createInsurancePolicy(policy: InsurancePolicyInsert): Promise<InsurancePolicy> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert({ ...policy, user_id: userId } as never)
      .select()
      .single();

    if (error) throw error;
    return data as InsurancePolicy;
  },

  /**
   * Update insurance policy
   */
  async updateInsurancePolicy(
    id: string,
    updates: InsurancePolicyUpdate
  ): Promise<InsurancePolicy> {
    await requireAuth();

    const { data, error } = await supabase
      .from('insurance_policies')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as InsurancePolicy;
  },

  /**
   * Delete insurance policy
   */
  async deleteInsurancePolicy(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // Reminders
  // ============================================

  /**
   * Get all reminders
   */
  async getReminders(): Promise<Reminder[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get unread reminders
   */
  async getUnreadReminders(): Promise<Reminder[]> {
    await requireAuth();

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_read', false)
      .order('remind_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(days = 7): Promise<UpcomingReminder[]> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .rpc('get_upcoming_reminders', {
        p_user_id: userId,
        p_days: days,
      } as never);

    if (error) throw error;
    return data as UpcomingReminder[];
  },

  /**
   * Create reminder
   */
  async createReminder(reminder: ReminderInsert): Promise<Reminder> {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from('reminders')
      .insert({ ...reminder, user_id: userId } as never)
      .select()
      .single();

    if (error) throw error;
    return data as Reminder;
  },

  /**
   * Update reminder
   */
  async updateReminder(id: string, updates: ReminderUpdate): Promise<Reminder> {
    await requireAuth();

    const { data, error } = await supabase
      .from('reminders')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Reminder;
  },

  /**
   * Mark reminder as read
   */
  async markReminderAsRead(id: string): Promise<Reminder> {
    return this.updateReminder(id, { is_read: true });
  },

  /**
   * Mark all reminders as read
   */
  async markAllRemindersAsRead(): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('reminders')
      .update({ is_read: true } as never)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Delete reminder
   */
  async deleteReminder(id: string): Promise<void> {
    await requireAuth();

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export default goalsApi;
