/**
 * NetWorthCard - Net Worth Trend Display
 * Shows current net worth with trend chart and change indicators
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NetWorthTrendChart, formatCurrency } from '@/components/charts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { NetWorthSnapshot } from '@/types/database';

interface NetWorthCardProps {
  currentNetWorth: number;
  previousNetWorth?: number;
  snapshots: NetWorthSnapshot[];
  className?: string;
}

export function NetWorthCard({
  currentNetWorth,
  previousNetWorth,
  snapshots,
  className,
}: NetWorthCardProps) {
  // Calculate change
  const change = previousNetWorth !== undefined
    ? currentNetWorth - previousNetWorth
    : 0;
  const changePercent = previousNetWorth && previousNetWorth !== 0
    ? (change / previousNetWorth) * 100
    : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">净值走势</CardTitle>
          {previousNetWorth !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              )}
              {isNegative && (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              {!isPositive && !isNegative && (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-emerald-600',
                  isNegative && 'text-red-600',
                  !isPositive && !isNegative && 'text-gray-500'
                )}
              >
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Net Worth */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">当前净值</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(currentNetWorth)}
            </p>
            {previousNetWorth !== undefined && change !== 0 && (
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-emerald-600',
                  isNegative && 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}{formatCurrency(change)}
              </span>
            )}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-[250px]">
          {snapshots.length > 0 ? (
            <NetWorthTrendChart
              data={snapshots}
              height={250}
              showTimeRangeSelector={true}
              defaultTimeRange="90d"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无历史数据
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default NetWorthCard;
