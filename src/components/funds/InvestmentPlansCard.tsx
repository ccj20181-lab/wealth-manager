/**
 * InvestmentPlansCard - Investment Plans Management
 * Shows and manages recurring investment plans
 */

import { format } from 'date-fns';
import { Calendar, Pause, Play, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/components/charts';
import type { InvestmentPlan, InvestmentFrequency } from '@/types/database';

interface InvestmentPlansCardProps {
  plans: InvestmentPlan[];
  isLoading?: boolean;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  isUpdating?: boolean;
}

const frequencyLabels: Record<InvestmentFrequency, string> = {
  daily: '每日',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
};

export function InvestmentPlansCard({
  plans,
  isLoading,
  onToggle,
  onDelete,
  onAdd,
  isUpdating,
}: InvestmentPlansCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>定投计划</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activePlans = plans?.filter((p) => p.is_active) || [];
  const inactivePlans = plans?.filter((p) => !p.is_active) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>定投计划</CardTitle>
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              新建定投
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(!plans || plans.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无定投计划，创建一个开始定期投资吧！
          </div>
        ) : (
          <div className="space-y-4">
            {activePlans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">进行中</h4>
                <div className="space-y-3">
                  {activePlans.map((plan) => (
                    <PlanItem
                      key={plan.id}
                      plan={plan}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactivePlans.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">已暂停</h4>
                <div className="space-y-3">
                  {inactivePlans.map((plan) => (
                    <PlanItem
                      key={plan.id}
                      plan={plan}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PlanItemProps {
  plan: InvestmentPlan;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

function PlanItem({ plan, onToggle, onDelete, isUpdating }: PlanItemProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${plan.is_active ? 'bg-background' : 'bg-muted/50'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{plan.fund?.name || '未知基金'}</span>
          <span className="text-xs text-muted-foreground">{plan.fund?.code}</span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span>{formatCurrency(plan.amount)}</span>
          <span>{plan.frequency ? frequencyLabels[plan.frequency] : '-'}</span>
          {plan.next_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(plan.next_date), 'MM-dd')}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(plan.id, !plan.is_active)}
            disabled={isUpdating}
          >
            {plan.is_active ? (
              <Pause className="h-4 w-4 text-yellow-500" />
            ) : (
              <Play className="h-4 w-4 text-green-500" />
            )}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(plan.id)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default InvestmentPlansCard;
