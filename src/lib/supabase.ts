/**
 * Wealth Manager - Supabase Client
 * 无需登录版本 - 使用固定用户ID
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 固定用户ID - 个人使用，无需登录
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

// Helper to get current user ID - 返回固定ID
export const getCurrentUserId = async (): Promise<string | null> => {
  return FIXED_USER_ID;
};

// Helper to require authenticated user - 直接返回固定ID
export const requireAuth = async (): Promise<string> => {
  return FIXED_USER_ID;
};

// 导出固定用户ID供其他模块使用
export const OWNER_USER_ID = FIXED_USER_ID;

export default supabase;
