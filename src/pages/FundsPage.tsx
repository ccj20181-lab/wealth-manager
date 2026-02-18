/**
 * FundsPage - Fund Investment Management
 * Main page for fund portfolio management
 */

import { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FundsSummaryCard,
  FundHoldingsTable,
  FundTransactionsTable,
  InvestmentPlansCard,
  AddTransactionDialog,
  AddInvestmentPlanDialog,
} from '@/components/funds';
import {
  useFundReturns,
  useFundTransactions,
  useInvestmentPlans,
  useCreateFundTransaction,
  useDeleteFundTransaction,
  useCreateInvestmentPlan,
  useToggleInvestmentPlan,
  useDeleteInvestmentPlan,
} from '@/hooks/useFunds';
import { useAccounts } from '@/hooks';
import type { FundTransactionInsert } from '@/types/database';

export function FundsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);

  // Data fetching
  const { data: returns, isLoading: isLoadingReturns } = useFundReturns();
  const { data: transactions, isLoading: isLoadingTransactions } = useFundTransactions();
  const { data: plans, isLoading: isLoadingPlans } = useInvestmentPlans();
  const { data: accounts = [] } = useAccounts({ isActive: true });

  // Mutations
  const createTransaction = useCreateFundTransaction();
  const createPlan = useCreateInvestmentPlan();
  const deleteTransaction = useDeleteFundTransaction();
  const togglePlan = useToggleInvestmentPlan();
  const deletePlan = useDeleteInvestmentPlan();

  const handleAddTransaction = async (data: FundTransactionInsert) => {
    await createTransaction.mutateAsync(data);
    if (location.pathname.endsWith('/funds/transaction')) {
      navigate('/funds', { replace: true });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('确定要删除这条交易记录吗？')) {
      deleteTransaction.mutate(id);
    }
  };

  const handleTogglePlan = (id: string, isActive: boolean) => {
    togglePlan.mutate({ id, isActive });
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('确定要删除这个定投计划吗？')) {
      deletePlan.mutate(id);
    }
  };

  useEffect(() => {
    if (location.pathname.endsWith('/funds/transaction')) {
      setIsAddDialogOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">基金投资</h1>
          <p className="text-muted-foreground">管理您的基金持仓和交易记录</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加交易
        </Button>
      </div>

      {/* Summary Cards */}
      <FundsSummaryCard returns={returns || []} isLoading={isLoadingReturns} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex gap-2 border-b pb-2">
          <TabsTrigger
            value="overview"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            持仓总览
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'transactions'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            交易记录
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'plans'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            定投计划
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <FundHoldingsTable returns={returns || []} isLoading={isLoadingReturns} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <FundTransactionsTable
            transactions={transactions || []}
            isLoading={isLoadingTransactions}
            onDelete={handleDeleteTransaction}
            isDeleting={deleteTransaction.isPending}
          />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <InvestmentPlansCard
            plans={plans || []}
            isLoading={isLoadingPlans}
            onToggle={handleTogglePlan}
            onDelete={handleDeletePlan}
            onAdd={() => setIsAddPlanOpen(true)}
            isUpdating={togglePlan.isPending || deletePlan.isPending}
          />
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddTransaction}
        isSubmitting={createTransaction.isPending}
      />

      {/* Add Investment Plan Dialog */}
      <AddInvestmentPlanDialog
        isOpen={isAddPlanOpen}
        onClose={() => setIsAddPlanOpen(false)}
        onSubmit={async (data) => {
          await createPlan.mutateAsync(data);
        }}
        isSubmitting={createPlan.isPending}
        accounts={accounts}
      />
    </div>
  );
}

export default FundsPage;
