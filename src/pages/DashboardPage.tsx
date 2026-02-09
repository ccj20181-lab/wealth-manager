/**
 * DashboardPage - Main Dashboard View
 * Displays comprehensive financial overview with charts and stats
 */

import { useMemo } from 'react';
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  StatCard,
  AssetOverviewCard,
  NetWorthCard,
  RecentTransactionsCard,
  GoalsOverviewCard,
  QuickActionsCard,
} from '@/components/dashboard';
import { formatCurrency } from '@/components/charts';
import {
  useDashboardSummary,
  useNetWorthHistory,
  useRecentTransactions,
  useGoalProgress,
  useCreateSnapshot,
} from '@/hooks';

export function DashboardPage() {
  // Fetch dashboard data
  const { data: summary, refetch: refetchSummary } = useDashboardSummary();
  const { data: netWorthHistory = [] } = useNetWorthHistory(12);
  const { data: recentTransactions = [] } = useRecentTransactions(5);
  const { data: goalProgress = [] } = useGoalProgress();
  const createSnapshot = useCreateSnapshot();

  // Calculate previous net worth for comparison
  const previousNetWorth = useMemo(() => {
    if (netWorthHistory.length >= 2) {
      return netWorthHistory[netWorthHistory.length - 2]?.net_worth;
    }
    return undefined;
  }, [netWorthHistory]);

  // Handle refresh
  const handleRefresh = async () => {
    await createSnapshot.mutateAsync();
    refetchSummary();
  };

  // Get current date info
  const now = new Date();
  const greeting = now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">
            {now.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={createSnapshot.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${createSnapshot.isPending ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总资产"
          value={summary ? formatCurrency(summary.netWorth.assets) : '¥0'}
          icon={<Wallet className="h-5 w-5" />}
          variant="primary"
          href="/accounts"
        />
        <StatCard
          title="基金投资"
          value={summary ? formatCurrency(summary.investments.totalValue) : '¥0'}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={summary?.investments.returnRate ? {
            value: summary.investments.returnRate * 100,
            label: '收益率',
          } : undefined}
          variant="success"
          href="/funds"
        />
        <StatCard
          title="本月收入"
          value={summary ? formatCurrency(summary.cashflow.monthlyIncome) : '¥0'}
          icon={<ArrowDownLeft className="h-5 w-5" />}
          variant="success"
          href="/cashflow?type=income"
        />
        <StatCard
          title="本月支出"
          value={summary ? formatCurrency(summary.cashflow.monthlyExpense) : '¥0'}
          icon={<ArrowUpRight className="h-5 w-5" />}
          variant="danger"
          href="/cashflow?type=expense"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Net Worth Trend */}
          <NetWorthCard
            currentNetWorth={summary?.netWorth.total ?? 0}
            previousNetWorth={previousNetWorth}
            snapshots={netWorthHistory}
          />

          {/* Recent Transactions */}
          <RecentTransactionsCard
            transactions={recentTransactions}
            maxItems={5}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Asset Overview */}
          <AssetOverviewCard
            totalAssets={summary?.netWorth.assets ?? 0}
            breakdown={summary?.netWorth.breakdown ?? {
              bank: 0,
              fund: 0,
              pension: 0,
              insurance: 0,
              other: 0,
            }}
          />

          {/* Goals Overview */}
          <GoalsOverviewCard
            goals={goalProgress}
            maxItems={3}
          />

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
