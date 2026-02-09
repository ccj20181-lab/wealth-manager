/**
 * BudgetCard - Budget Progress Display
 * Shows budget category with usage progress and alerts
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, PROGRESS_COLORS } from '@/components/charts';
import { AlertTriangle } from 'lucide-react';
import type { BudgetStatus } from '@/types/database';

interface BudgetCardProps {
  budgets: BudgetStatus[];
  className?: string;
}

interface BudgetItemProps {
  budget: BudgetStatus;
}

function BudgetItem({ budget }: BudgetItemProps) {
  const barColor: string = budget.is_over_budget
    ? PROGRESS_COLORS.low
    : budget.is_warning
    ? PROGRESS_COLORS.medium
    : PROGRESS_COLORS.high;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{budget.category_name}</span>
          {(budget.is_over_budget || budget.is_warning) && (
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                budget.is_over_budget ? 'text-red-500' : 'text-amber-500'
              )}
            />
          )}
        </div>
        <div className="text-right">
          <span
            className={cn(
              'text-sm font-medium',
              budget.is_over_budget && 'text-red-600'
            )}
          >
            {formatCurrency(budget.spent_amount)}
          </span>
          <span className="text-sm text-muted-foreground">
            {' / '}{formatCurrency(budget.budget_amount)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: PROGRESS_COLORS.background }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(budget.usage_percentage, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {/* Over budget indicator */}
        {budget.is_over_budget && (
          <div
            className="absolute top-0 h-2 bg-red-200 rounded-r-full"
            style={{
              left: '100%',
              width: `${Math.min(budget.usage_percentage - 100, 50)}%`,
            }}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{budget.usage_percentage.toFixed(0)}% 已用</span>
        <span>
          {budget.is_over_budget
            ? `超支 ${formatCurrency(Math.abs(budget.remaining_amount))}`
            : `剩余 ${formatCurrency(budget.remaining_amount)}`}
        </span>
      </div>
    </div>
  );
}

export function BudgetCard({ budgets, className }: BudgetCardProps) {
  // Sort by usage percentage descending
  const sortedBudgets = [...budgets].sort(
    (a, b) => b.usage_percentage - a.usage_percentage
  );

  const overBudgetCount = budgets.filter((b) => b.is_over_budget).length;
  const warningCount = budgets.filter((b) => b.is_warning && !b.is_over_budget).length;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">预算执行</CardTitle>
          {(overBudgetCount > 0 || warningCount > 0) && (
            <div className="flex gap-2 text-xs">
              {overBudgetCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full">
                  {overBudgetCount} 项超支
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full">
                  {warningCount} 项预警
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedBudgets.length > 0 ? (
          <div className="space-y-4">
            {sortedBudgets.map((budget) => (
              <BudgetItem key={budget.budget_id} budget={budget} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>暂未设置预算</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetCard;
