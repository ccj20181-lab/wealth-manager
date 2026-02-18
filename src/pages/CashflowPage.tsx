/**
 * CashflowPage - 现金流管理页面
 * 收入支出记录、预算管理、月度统计
 */

import { useState } from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  TransactionList,
  TransactionForm,
  MonthlyStats,
  BudgetCard,
  BudgetManagerDialog,
} from '@/components/cashflow';
import { CashflowTrendChart } from '@/components/charts';
import {
  useCashflowTransactions,
  useCategories,
  useCreateCashflowTransaction,
  useMonthlySummary,
  useBudgetStatus,
  useCashflowTrend,
  useBudgets,
  useCreateBudget,
  useDeleteBudget,
} from '@/hooks/useCashflow';
import type { CashflowTransactionInsert } from '@/types/database';

export function CashflowPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get current and previous month info
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Fetch data
  const { data: transactions = [], isLoading: transactionsLoading } =
    useCashflowTransactions();
  const { data: categories = [] } = useCategories();
  const { data: currentSummary } = useMonthlySummary(currentYear, currentMonth);
  const { data: previousSummary } = useMonthlySummary(prevYear, prevMonth);
  const { data: budgetStatus = [] } = useBudgetStatus(currentYear, currentMonth);
  const { data: cashflowTrend = [] } = useCashflowTrend(6);
  const { data: budgets = [] } = useBudgets();

  // Mutations
  const createTransaction = useCreateCashflowTransaction();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();

  const defaultType = useMemo<'income' | 'expense'>(() => {
    const t = searchParams.get('type');
    return t === 'income' ? 'income' : 'expense';
  }, [searchParams]);

  // Handle form submit
  const handleAddTransaction = async (data: CashflowTransactionInsert) => {
    await createTransaction.mutateAsync(data);
    if (location.pathname.endsWith('/cashflow/add')) {
      navigate('/cashflow', { replace: true });
    }
  };

  // Build transactions with category info
  const transactionsWithCategory = transactions.map((t) => ({
    ...t,
    category: categories.find((c) => c.id === t.category_id),
  }));

  useEffect(() => {
    if (location.pathname.endsWith('/cashflow/add')) {
      setIsFormOpen(true);
    }
  }, [location.pathname]);

  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">现金流管理</h1>
          <p className="text-muted-foreground">
            记录收支，掌控财务
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsBudgetOpen(true)}>
            预算设置
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            记一笔
          </Button>
        </div>
      </div>

      {/* Monthly Stats */}
      {currentSummary && (
        <MonthlyStats
          current={currentSummary}
          previous={previousSummary}
        />
      )}

      {/* Charts and Budget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Trend Chart */}
        <div className="h-[300px]">
          <CashflowTrendChart
            data={cashflowTrend}
            height={300}
          />
        </div>

        {/* Budget Status */}
        <BudgetCard budgets={budgetStatus} />
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactionsWithCategory}
        isLoading={transactionsLoading}
      />

      {/* Add Transaction Form */}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddTransaction}
        categories={categories}
        defaultType={defaultType}
        isLoading={createTransaction.isPending}
      />

      <BudgetManagerDialog
        open={isBudgetOpen}
        onOpenChange={setIsBudgetOpen}
        budgets={budgets}
        categories={categories}
        isUpdating={createBudget.isPending || deleteBudget.isPending}
        onCreate={async (payload) => {
          await createBudget.mutateAsync(payload);
        }}
        onDelete={async (id) => {
          await deleteBudget.mutateAsync(id);
        }}
      />
    </div>
  );
}

export default CashflowPage;
