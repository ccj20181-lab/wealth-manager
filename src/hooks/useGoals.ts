/**
 * Wealth Manager - Goals Hooks
 * React Query hooks for goals, insurance, and reminders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '@/services/api/goals';
import type {
  FinancialGoalInsert,
  FinancialGoalUpdate,
  InsurancePolicyInsert,
  InsurancePolicyUpdate,
  ReminderInsert,
  ReminderUpdate,
} from '@/types/database';
import { useAuth } from './useAuth';

// Query keys
export const goalsKeys = {
  all: ['goals'] as const,
  list: () => [...goalsKeys.all, 'list'] as const,
  active: () => [...goalsKeys.all, 'active'] as const,
  progress: () => [...goalsKeys.all, 'progress'] as const,
  detail: (id: string) => [...goalsKeys.all, 'detail', id] as const,
  insurance: () => [...goalsKeys.all, 'insurance'] as const,
  activeInsurance: () => [...goalsKeys.all, 'insurance', 'active'] as const,
  reminders: () => [...goalsKeys.all, 'reminders'] as const,
  unreadReminders: () => [...goalsKeys.all, 'reminders', 'unread'] as const,
  upcomingReminders: (days: number) =>
    [...goalsKeys.all, 'reminders', 'upcoming', days] as const,
};

// ============================================
// Financial Goals
// ============================================

export function useGoals() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.list(),
    queryFn: goalsApi.getGoals,
    enabled: isAuthenticated,
  });
}

export function useActiveGoals() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.active(),
    queryFn: goalsApi.getActiveGoals,
    enabled: isAuthenticated,
  });
}

export function useGoalProgress() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.progress(),
    queryFn: goalsApi.getGoalProgress,
    enabled: isAuthenticated,
  });
}

export function useGoal(id: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.detail(id),
    queryFn: () => goalsApi.getGoal(id),
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: FinancialGoalInsert) => goalsApi.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: FinancialGoalUpdate }) =>
      goalsApi.updateGoal(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.list() });
      queryClient.invalidateQueries({ queryKey: goalsKeys.progress() });
      queryClient.setQueryData(goalsKeys.detail(data.id), data);
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentAmount }: { id: string; currentAmount: number }) =>
      goalsApi.updateGoalProgress(id, currentAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
    },
  });
}

export function useCompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.completeGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.all });
    },
  });
}

// ============================================
// Insurance Policies
// ============================================

export function useInsurancePolicies() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.insurance(),
    queryFn: goalsApi.getInsurancePolicies,
    enabled: isAuthenticated,
  });
}

export function useActiveInsurancePolicies() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.activeInsurance(),
    queryFn: goalsApi.getActiveInsurancePolicies,
    enabled: isAuthenticated,
  });
}

export function useCreateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: InsurancePolicyInsert) =>
      goalsApi.createInsurancePolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.insurance() });
    },
  });
}

export function useUpdateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: InsurancePolicyUpdate }) =>
      goalsApi.updateInsurancePolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.insurance() });
    },
  });
}

export function useDeleteInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.deleteInsurancePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.insurance() });
    },
  });
}

// ============================================
// Reminders
// ============================================

export function useReminders() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.reminders(),
    queryFn: goalsApi.getReminders,
    enabled: isAuthenticated,
  });
}

export function useUnreadReminders() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.unreadReminders(),
    queryFn: goalsApi.getUnreadReminders,
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useUpcomingReminders(days = 7) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: goalsKeys.upcomingReminders(days),
    queryFn: () => goalsApi.getUpcomingReminders(days),
    enabled: isAuthenticated,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminder: ReminderInsert) => goalsApi.createReminder(reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.reminders() });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ReminderUpdate }) =>
      goalsApi.updateReminder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.reminders() });
    },
  });
}

export function useMarkReminderAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.markReminderAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.reminders() });
    },
  });
}

export function useMarkAllRemindersAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalsApi.markAllRemindersAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.reminders() });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.reminders() });
    },
  });
}
