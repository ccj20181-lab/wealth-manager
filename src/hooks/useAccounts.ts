/**
 * Wealth Manager - Accounts Hooks
 * React Query hooks for asset accounts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi, type AccountFilters } from '@/services/api/accounts';
import type { AssetAccountInsert, AssetAccountUpdate } from '@/types/database';
import { useAuth } from './useAuth';

export const accountsKeys = {
  all: ['accounts'] as const,
  list: (filters?: AccountFilters) => [...accountsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...accountsKeys.all, 'detail', id] as const,
};

export function useAccounts(filters?: AccountFilters) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: accountsKeys.list(filters),
    queryFn: () => accountsApi.getAccounts(filters),
    enabled: isAuthenticated,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (account: AssetAccountInsert) => accountsApi.createAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AssetAccountUpdate }) =>
      accountsApi.updateAccount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all });
    },
  });
}

