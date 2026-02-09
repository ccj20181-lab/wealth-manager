/**
 * Wealth Manager - Funds Hooks
 * React Query hooks for fund management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fundsApi, type TransactionFilters } from '@/services/api/funds';
import type {
  FundTransactionInsert,
  InvestmentPlanInsert,
  InvestmentPlanUpdate,
} from '@/types/database';
import { useAuth } from './useAuth';

// Query keys
export const fundsKeys = {
  all: ['funds'] as const,
  search: (keyword: string) => [...fundsKeys.all, 'search', keyword] as const,
  holdings: () => [...fundsKeys.all, 'holdings'] as const,
  returns: () => [...fundsKeys.all, 'returns'] as const,
  transactions: (filters?: TransactionFilters) =>
    [...fundsKeys.all, 'transactions', filters] as const,
  plans: () => [...fundsKeys.all, 'plans'] as const,
  activePlans: () => [...fundsKeys.all, 'plans', 'active'] as const,
};

// Search funds
export function useSearchFunds(keyword: string) {
  return useQuery({
    queryKey: fundsKeys.search(keyword),
    queryFn: () => fundsApi.searchFunds(keyword),
    enabled: keyword.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get fund holdings
export function useFundHoldings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: fundsKeys.holdings(),
    queryFn: fundsApi.getHoldings,
    enabled: isAuthenticated,
  });
}

// Get fund returns
export function useFundReturns() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: fundsKeys.returns(),
    queryFn: fundsApi.getFundReturns,
    enabled: isAuthenticated,
  });
}

// Get fund transactions
export function useFundTransactions(filters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: fundsKeys.transactions(filters),
    queryFn: () => fundsApi.getTransactions(filters),
    enabled: isAuthenticated,
  });
}

// Create fund transaction
export function useCreateFundTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: FundTransactionInsert) =>
      fundsApi.createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.holdings() });
      queryClient.invalidateQueries({ queryKey: fundsKeys.returns() });
      queryClient.invalidateQueries({ queryKey: fundsKeys.transactions() });
    },
  });
}

// Delete fund transaction
export function useDeleteFundTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fundsApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.holdings() });
      queryClient.invalidateQueries({ queryKey: fundsKeys.returns() });
      queryClient.invalidateQueries({ queryKey: fundsKeys.transactions() });
    },
  });
}

// Get investment plans
export function useInvestmentPlans() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: fundsKeys.plans(),
    queryFn: fundsApi.getInvestmentPlans,
    enabled: isAuthenticated,
  });
}

// Get active investment plans
export function useActiveInvestmentPlans() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: fundsKeys.activePlans(),
    queryFn: fundsApi.getActiveInvestmentPlans,
    enabled: isAuthenticated,
  });
}

// Create investment plan
export function useCreateInvestmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: InvestmentPlanInsert) => fundsApi.createInvestmentPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.plans() });
    },
  });
}

// Update investment plan
export function useUpdateInvestmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: InvestmentPlanUpdate }) =>
      fundsApi.updateInvestmentPlan(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.plans() });
    },
  });
}

// Toggle investment plan active status
export function useToggleInvestmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fundsApi.toggleInvestmentPlanActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.plans() });
    },
  });
}

// Delete investment plan
export function useDeleteInvestmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fundsApi.deleteInvestmentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundsKeys.plans() });
    },
  });
}
