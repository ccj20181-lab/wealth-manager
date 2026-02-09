/**
 * Wealth Manager - Cashflow Hooks
 * React Query hooks for cashflow management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashflowApi, type TransactionFilters } from '@/services/api/cashflow';
import type {
  CashflowCategoryInsert,
  CashflowTransactionInsert,
  CashflowTransactionUpdate,
  BudgetInsert,
  BudgetUpdate,
} from '@/types/database';
import { useAuth } from './useAuth';

// Query keys
export const cashflowKeys = {
  all: ['cashflow'] as const,
  categories: () => [...cashflowKeys.all, 'categories'] as const,
  categoriesByType: (type: 'income' | 'expense') =>
    [...cashflowKeys.all, 'categories', type] as const,
  categoriesTree: () => [...cashflowKeys.all, 'categories', 'tree'] as const,
  transactions: (filters?: TransactionFilters) =>
    [...cashflowKeys.all, 'transactions', filters] as const,
  recentTransactions: (limit: number) =>
    [...cashflowKeys.all, 'transactions', 'recent', limit] as const,
  monthlySummary: (year: number, month: number) =>
    [...cashflowKeys.all, 'summary', year, month] as const,
  trend: (months: number) => [...cashflowKeys.all, 'trend', months] as const,
  budgets: () => [...cashflowKeys.all, 'budgets'] as const,
  budgetStatus: (year: number, month: number) =>
    [...cashflowKeys.all, 'budgetStatus', year, month] as const,
};

// ============================================
// Categories
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: cashflowKeys.categories(),
    queryFn: cashflowApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCategoriesByType(type: 'income' | 'expense') {
  return useQuery({
    queryKey: cashflowKeys.categoriesByType(type),
    queryFn: () => cashflowApi.getCategoriesByType(type),
    staleTime: 30 * 60 * 1000,
  });
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: cashflowKeys.categoriesTree(),
    queryFn: cashflowApi.getCategoriesTree,
    staleTime: 30 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CashflowCategoryInsert) =>
      cashflowApi.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.categories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cashflowApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.categories() });
    },
  });
}

// ============================================
// Transactions
// ============================================

export function useCashflowTransactions(filters?: TransactionFilters) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.transactions(filters),
    queryFn: () => cashflowApi.getTransactions(filters),
    enabled: isAuthenticated,
  });
}

export function useRecentTransactions(limit = 10) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.recentTransactions(limit),
    queryFn: () => cashflowApi.getRecentTransactions(limit),
    enabled: isAuthenticated,
  });
}

export function useCreateCashflowTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: CashflowTransactionInsert) =>
      cashflowApi.createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}

export function useUpdateCashflowTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CashflowTransactionUpdate }) =>
      cashflowApi.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}

export function useDeleteCashflowTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cashflowApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}

// ============================================
// Statistics
// ============================================

export function useMonthlySummary(year: number, month: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.monthlySummary(year, month),
    queryFn: () => cashflowApi.getMonthlySummary(year, month),
    enabled: isAuthenticated,
  });
}

export function useCashflowTrend(months = 12) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.trend(months),
    queryFn: () => cashflowApi.getCashflowTrend(months),
    enabled: isAuthenticated,
  });
}

// ============================================
// Budgets
// ============================================

export function useBudgets() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.budgets(),
    queryFn: cashflowApi.getBudgets,
    enabled: isAuthenticated,
  });
}

export function useBudgetStatus(year: number, month: number) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cashflowKeys.budgetStatus(year, month),
    queryFn: () => cashflowApi.getBudgetStatus(year, month),
    enabled: isAuthenticated,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budget: BudgetInsert) => cashflowApi.createBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BudgetUpdate }) =>
      cashflowApi.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cashflowApi.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashflowKeys.budgets() });
      queryClient.invalidateQueries({ queryKey: cashflowKeys.all });
    },
  });
}
