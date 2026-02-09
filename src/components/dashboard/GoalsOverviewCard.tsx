/**
 * GoalsOverviewCard - Financial Goals Overview
 * Displays active goals with progress indicators
 */

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalProgressBar, formatCurrency } from '@/components/charts';
import { cn } from '@/lib/utils';
import { Plus, ChevronRight, Target } from 'lucide-react';
import type { GoalProgress } from '@/types/database';

interface GoalsOverviewCardProps {
  goals: GoalProgress[];
  maxItems?: number;
  className?: string;
  onAddGoal?: () => void;
}

export function GoalsOverviewCard({
  goals,
  maxItems = 4,
  className,
  onAddGoal,
}: GoalsOverviewCardProps) {
  const displayGoals = goals.slice(0, maxItems);
  const remainingCount = goals.length - maxItems;

  const formatDaysRemaining = (days: number | null) => {
    if (days === null) return '无截止日期';
    if (days < 0) return '已逾期';
    if (days === 0) return '今天截止';
    if (days <= 7) return `剩余 ${days} 天`;
    if (days <= 30) return `剩余 ${Math.ceil(days / 7)} 周`;
    return `剩余 ${Math.ceil(days / 30)} 个月`;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">理财目标</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddGoal}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/goals" className="flex items-center gap-1">
                查看全部
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayGoals.length > 0 ? (
          <div className="space-y-4">
            {displayGoals.map((goal) => (
              <div key={goal.goal_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {goal.goal_name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-xs',
                      goal.days_remaining !== null && goal.days_remaining < 30
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatDaysRemaining(goal.days_remaining)}
                  </span>
                </div>
                <GoalProgressBar
                  currentAmount={goal.current_amount}
                  targetAmount={goal.target_amount}
                  showPercentage={true}
                  showAmount={false}
                  height={6}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(goal.current_amount)}</span>
                  <span>{formatCurrency(goal.target_amount)}</span>
                </div>
              </div>
            ))}

            {remainingCount > 0 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                还有 {remainingCount} 个目标
              </p>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>还没有设定目标</p>
            <Button
              variant="link"
              onClick={onAddGoal}
              className="mt-2"
            >
              创建第一个目标
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GoalsOverviewCard;
