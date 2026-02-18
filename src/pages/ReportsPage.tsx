/**
 * ReportsPage - 报表中心（MVP）
 * 目标：把“钱去哪了/钱从哪来/资产怎么变”用更贴近中国用户的方式呈现
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseCategoryChart, CashflowTrendChart, AssetAllocationChart, formatCurrency } from '@/components/charts';
import { useCashflowTrend, useMonthlySummary, useDashboardSummary } from '@/hooks';

export function ReportsPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: summary } = useMonthlySummary(year, month);
  const { data: trend = [] } = useCashflowTrend(12);
  const { data: dashboardSummary } = useDashboardSummary();

  const topExpenses = useMemo(() => {
    const exp = summary?.expense_by_category ?? {};
    const entries = Object.entries(exp)
      .map(([category, amount]) => ({ category, amount }))
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return entries.slice(0, 8);
  }, [summary]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">报表</h1>
        <p className="text-muted-foreground">一眼看清本月收支与资产变化</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              +{formatCurrency(summary?.total_income ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatCurrency(summary?.total_expense ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月结余</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((summary?.total_income ?? 0) - (summary?.total_expense ?? 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">当前净值</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardSummary?.netWorth.total ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">12个月收支趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <CashflowTrendChart data={trend} height={320} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">本月支出结构</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ExpenseCategoryChart data={topExpenses} height={320} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">资产配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[280px]">
              <AssetAllocationChart data={dashboardSummary?.netWorth.breakdown ?? { bank: 0, fund: 0, pension: 0, insurance: 0, other: 0 }} height={280} />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">总资产</div>
              <div className="text-3xl font-bold">{formatCurrency(dashboardSummary?.netWorth.assets ?? 0)}</div>
              <div className="text-sm text-muted-foreground mt-4">提示</div>
              <div className="text-sm text-muted-foreground">
                资产配置来自账户余额与基金持仓市值。建议先补齐“资产账户”和“基金交易”两块数据。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;
