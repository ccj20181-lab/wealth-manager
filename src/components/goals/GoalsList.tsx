/**
 * GoalsList - Goals Overview List
 * Displays all goals with progress rings and summary
 */

import { Target, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalCard } from './GoalCard';
import { formatCurrency } from '@/components/charts';
import type { GoalProgress } from '@/types/database';

interface GoalsListProps {
  goals: GoalProgress[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdateProgress?: (id: string) => void;
  isUpdating?: boolean;
}

export function GoalsList({
  goals,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onComplete,
  onUpdateProgress,
  isUpdating,
}: GoalsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate summary
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  const completedCount = goals.filter((g) => g.progress_percentage >= 100).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{goals.length}</div>
              <div className="text-sm text-muted-foreground">目标总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-muted-foreground">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(totalTarget)}</div>
              <div className="text-sm text-muted-foreground">目标总额</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {overallProgress.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">整体进度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          我的目标
        </h2>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            新建目标
          </Button>
        )}
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">还没有设置目标</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              创建您的第一个财务目标，开始追踪进度吧！
            </p>
            {onAdd && (
              <Button className="mt-4" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                创建目标
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onUpdateProgress={onUpdateProgress}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalsList;
