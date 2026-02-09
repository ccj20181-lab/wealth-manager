/**
 * CashflowPage - 现金流管理页面
 * 收入支出记录、预算管理、月度统计
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  TransactionList,
  TransactionForm,
  MonthlyStats,
  BudgetCard,
} from '@/components/cashflow';
import { CashflowTrendChart } from '@/components/charts';
import {
  useCashflowTransactions,
  useCategories,
  useCreateCashflowTransaction,
  useMonthlySummary,
  useBudgetStatus,
  useCashflowTrend,
} from '@/hooks/useCashflow';
import type { CashflowTransactionInsert } from '@/types/database';

export function CashflowPage() {
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

  // Mutations
  const createTransaction = useCreateCashflowTransaction();

  // Handle form submit
  const handleAddTransaction = async (data: CashflowTransactionInsert) => {
    await createTransaction.mutateAsync(data);
  };

  // Build transactions with category info
  const transactionsWithCategory = transactions.map((t) => ({
    ...t,
    category: categories.find((c) => c.id === t.category_id),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">现金流管理</h1>
          <p className="text-muted-foreground">
            记录收支，掌控财务
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          记一笔
        </Button>
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
        isLoading={createTransaction.isPending}
      />
    </div>
  );
}

export default CashflowPage;
