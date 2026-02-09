/**
 * Wealth Manager - Hooks Index
 * Re-export all hooks
 */

// Auth
export {
  useAuth,
  useProfile,
  useSignUp,
  useSignIn,
  useSignOut,
  useUpdateProfile,
  useResetPassword,
  useUpdatePassword,
  useRequireAuth,
  authKeys,
} from './useAuth';

// Funds
export {
  useSearchFunds,
  useFundHoldings,
  useFundReturns,
  useFundTransactions,
  useCreateFundTransaction,
  useDeleteFundTransaction,
  useInvestmentPlans,
  useActiveInvestmentPlans,
  useCreateInvestmentPlan,
  useUpdateInvestmentPlan,
  useToggleInvestmentPlan,
  useDeleteInvestmentPlan,
  fundsKeys,
} from './useFunds';

// Cashflow
export {
  useCategories,
  useCategoriesByType,
  useCategoriesTree,
  useCreateCategory,
  useDeleteCategory,
  useCashflowTransactions,
  useRecentTransactions,
  useCreateCashflowTransaction,
  useUpdateCashflowTransaction,
  useDeleteCashflowTransaction,
  useMonthlySummary,
  useCashflowTrend,
  useBudgets,
  useBudgetStatus,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  cashflowKeys,
} from './useCashflow';

// Goals
export {
  useGoals,
  useActiveGoals,
  useGoalProgress,
  useGoal,
  useCreateGoal,
  useUpdateGoal,
  useUpdateGoalProgress,
  useCompleteGoal,
  useDeleteGoal,
  useInsurancePolicies,
  useActiveInsurancePolicies,
  useCreateInsurancePolicy,
  useUpdateInsurancePolicy,
  useDeleteInsurancePolicy,
  useReminders,
  useUnreadReminders,
  useUpcomingReminders,
  useCreateReminder,
  useUpdateReminder,
  useMarkReminderAsRead,
  useMarkAllRemindersAsRead,
  useDeleteReminder,
  goalsKeys,
} from './useGoals';

// Dashboard
export {
  useNetWorth,
  useNetWorthHistory,
  useLatestSnapshot,
  useCreateSnapshot,
  useDashboardSummary,
  useQuickStats,
  useAssetAllocation,
  useDashboard,
  useRefreshDashboard,
  dashboardKeys,
} from './useDashboard';
