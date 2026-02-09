/**
 * Wealth Manager - Auth Hook
 * React Query hooks for authentication
 */

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authApi, type SignUpParams, type SignInParams } from '@/services/api/auth';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Auth state hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Invalidate queries on auth change
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}

// User profile hook
export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Sign up mutation
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SignUpParams) => authApi.signUp(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SignInParams) => authApi.signIn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.resetPassword(email),
  });
}

// Update password mutation
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => authApi.updatePassword(newPassword),
  });
}

// Require auth helper hook
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, loading, redirectTo]);

  return { user, loading };
}
