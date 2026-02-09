/**
 * GoalCard - Individual Goal Display Card
 * Shows goal info with progress ring and actions
 */

import { Target, Calendar, TrendingUp, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalProgressRing } from './GoalProgressRing';
import type { GoalProgress } from '@/types/database';

interface GoalCardProps {
  goal: GoalProgress;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdateProgress?: (id: string) => void;
  isUpdating?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getProgressColor(progress: number): 'default' | 'success' | 'warning' | 'danger' {
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'default';
  if (progress >= 50) return 'warning';
  return 'danger';
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onUpdateProgress,
  isUpdating,
}: GoalCardProps) {
  const daysRemaining = goal.days_remaining;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isCompleted = goal.progress_percentage >= 100;

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Progress Ring */}
          <GoalProgressRing
            progress={goal.progress_percentage}
            size={80}
            strokeWidth={6}
            color={getProgressColor(goal.progress_percentage)}
          />

          {/* Goal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base truncate">{goal.goal_name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>目标: {formatCurrency(goal.target_amount)}</span>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="flex items-center gap-1">
                {!isCompleted && onUpdateProgress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateProgress(goal.goal_id)}
                    disabled={isUpdating}
                    title="更新进度"
                  >
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
                {!isCompleted && onComplete && goal.progress_percentage >= 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onComplete(goal.goal_id)}
                    disabled={isUpdating}
                    title="标记完成"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(goal.goal_id)}
                    disabled={isUpdating}
                    title="编辑"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(goal.goal_id)}
                    disabled={isUpdating}
                    title="删除"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Details */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">当前进度</span>
                <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                />
              </div>

              {/* Deadline & Monthly Required */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {goal.deadline ? (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span className={isOverdue ? 'text-red-500' : ''}>
                      {isOverdue
                        ? `已逾期 ${Math.abs(daysRemaining!)} 天`
                        : `剩余 ${daysRemaining} 天`}
                    </span>
                  </div>
                ) : (
                  <span>无截止日期</span>
                )}

                {goal.monthly_required !== null && !isCompleted && (
                  <span>
                    每月需存: {formatCurrency(goal.monthly_required)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GoalCard;
