/**
 * MonthlyStats - Monthly Income/Expense Summary
 * Shows current month stats with comparison to previous month
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/charts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MonthlyCashflowSummary } from '@/types/database';

interface MonthlyStatsProps {
  current: MonthlyCashflowSummary;
  previous?: MonthlyCashflowSummary;
  className?: string;
}

interface StatItemProps {
  label: string;
  value: number;
  previousValue?: number;
  type: 'income' | 'expense' | 'net';
}

function StatItem({ label, value, previousValue, type }: StatItemProps) {
  const change = previousValue !== undefined ? value - previousValue : 0;
  const changePercent = previousValue && previousValue !== 0
    ? (change / previousValue) * 100
    : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const colorClass = {
    income: 'text-emerald-600',
    expense: 'text-red-600',
    net: value >= 0 ? 'text-emerald-600' : 'text-red-600',
  }[type];

  return (
    <div className="text-center p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', colorClass)}>
        {type === 'income' && '+'}
        {type === 'expense' && '-'}
        {formatCurrency(Math.abs(value))}
      </p>
      {previousValue !== undefined && (
        <div className="flex items-center justify-center gap-1 mt-1">
          {isPositive && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
          {!isPositive && !isNegative && <Minus className="h-3 w-3 text-gray-400" />}
          <span
            className={cn(
              'text-xs',
              isPositive && 'text-emerald-600',
              isNegative && 'text-red-600',
              !isPositive && !isNegative && 'text-gray-500'
            )}
          >
            {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function MonthlyStats({
  current,
  previous,
  className,
}: MonthlyStatsProps) {
  const netCashflow = current.total_income - current.total_expense;
  const previousNet = previous
    ? previous.total_income - previous.total_expense
    : undefined;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">本月概览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 divide-x">
          <StatItem
            label="收入"
            value={current.total_income}
            previousValue={previous?.total_income}
            type="income"
          />
          <StatItem
            label="支出"
            value={current.total_expense}
            previousValue={previous?.total_expense}
            type="expense"
          />
          <StatItem
            label="结余"
            value={netCashflow}
            previousValue={previousNet}
            type="net"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyStats;
