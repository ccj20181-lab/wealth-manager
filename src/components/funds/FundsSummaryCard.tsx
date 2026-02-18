/**
 * FundsSummaryCard - Fund Portfolio Summary
 * Shows total value, profit/loss, and return rate
 */

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/components/charts';
import type { FundReturn } from '@/types/database';

interface FundsSummaryCardProps {
  returns: FundReturn[];
  isLoading?: boolean;
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function FundsSummaryCard({ returns, isLoading }: FundsSummaryCardProps) {
  const summary = useMemo(() => {
    if (!returns || returns.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        returnRate: 0,
        holdingCount: 0,
      };
    }

    const totalValue = returns.reduce((sum, r) => sum + r.current_value, 0);
    const totalCost = returns.reduce((sum, r) => sum + r.cost_basis, 0);
    const totalProfit = returns.reduce((sum, r) => sum + r.profit_loss, 0);
    const returnRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalProfit,
      returnRate,
      holdingCount: returns.length,
    };
  }, [returns]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isProfit = summary.totalProfit >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">持仓市值</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            成本 {formatCurrency(summary.totalCost)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">持仓收益</CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {isProfit ? '+' : ''}{formatCurrency(summary.totalProfit)}
          </div>
          <p className={`text-xs ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercentage(summary.returnRate)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">收益率</CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(summary.returnRate)}
          </div>
          <p className="text-xs text-muted-foreground">
            总收益率
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">持仓数量</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.holdingCount}</div>
          <p className="text-xs text-muted-foreground">
            只基金
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default FundsSummaryCard;
