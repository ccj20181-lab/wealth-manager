/**
 * Wealth Manager - Dashboard Hooks
 * React Query hooks for dashboard data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api/dashboard';
import { useAuth } from './useAuth';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  netWorth: () => [...dashboardKeys.all, 'netWorth'] as const,
  netWorthHistory: (months: number) =>
    [...dashboardKeys.all, 'netWorthHistory', months] as const,
  latestSnapshot: () => [...dashboardKeys.all, 'latestSnapshot'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  quickStats: () => [...dashboardKeys.all, 'quickStats'] as const,
  assetAllocation: () => [...dashboardKeys.all, 'assetAllocation'] as const,
};

// ============================================
// Net Worth
// ============================================

export function useNetWorth() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.netWorth(),
    queryFn: dashboardApi.calculateNetWorth,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useNetWorthHistory(months = 12) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.netWorthHistory(months),
    queryFn: () => dashboardApi.getNetWorthHistory(months),
    enabled: isAuthenticated,
  });
}

export function useLatestSnapshot() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.latestSnapshot(),
    queryFn: dashboardApi.getLatestSnapshot,
    enabled: isAuthenticated,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.createSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.latestSnapshot() });
    },
  });
}

// ============================================
// Dashboard Summary
// ============================================

export function useDashboardSummary() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardApi.getDashboardSummary,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useQuickStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.quickStats(),
    queryFn: dashboardApi.getQuickStats,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// Asset Allocation
// ============================================

export function useAssetAllocation() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: dashboardKeys.assetAllocation(),
    queryFn: dashboardApi.getAssetAllocation,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Composite Hooks
// ============================================

/**
 * Hook to get all dashboard data at once
 */
export function useDashboard() {
  const summary = useDashboardSummary();
  const netWorthHistory = useNetWorthHistory(12);
  const assetAllocation = useAssetAllocation();

  return {
    summary,
    netWorthHistory,
    assetAllocation,
    isLoading: summary.isLoading || netWorthHistory.isLoading || assetAllocation.isLoading,
    isError: summary.isError || netWorthHistory.isError || assetAllocation.isError,
  };
}

/**
 * Hook to refresh all dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
}
