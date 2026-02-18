/**
 * Wealth Manager - User Profile API Service
 * 本项目已移除注册/登录/找回密码等显式认证流程，仅保留“当前会话用户”的资料读写。
 */

import { supabase } from '@/lib/supabase';
import type { UserProfile, UserProfileUpdate } from '@/types/database';

export const authApi = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // 新用户首次登录：profile 可能不存在，直接创建一条默认记录
    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ id: user.id, currency: 'CNY' } as never)
        .select('*')
        .single();
      if (insertError) throw insertError;
      return inserted as UserProfile;
    }

    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: UserProfileUpdate): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // upsert: 兼容 profile 尚未创建的情况
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates } as never, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },
};

export default authApi;
