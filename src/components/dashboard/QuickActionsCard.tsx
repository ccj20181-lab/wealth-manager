/**
 * QuickActionsCard - Quick Action Buttons
 * Provides shortcuts for common operations
 */

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  PiggyBank,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'income' | 'expense' | 'primary';
}

interface QuickActionsCardProps {
  className?: string;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onAddGoal?: () => void;
  onAddInvestment?: () => void;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  income: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
  expense: 'bg-red-100 text-red-600 hover:bg-red-200',
  primary: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
};

export function QuickActionsCard({
  className,
  onAddIncome,
  onAddExpense,
  onAddGoal,
  onAddInvestment,
}: QuickActionsCardProps) {
  const actions: QuickAction[] = [
    {
      id: 'income',
      label: '记收入',
      icon: <ArrowDownLeft className="h-5 w-5" />,
      onClick: onAddIncome,
      href: onAddIncome ? undefined : '/cashflow/add?type=income',
      variant: 'income',
    },
    {
      id: 'expense',
      label: '记支出',
      icon: <ArrowUpRight className="h-5 w-5" />,
      onClick: onAddExpense,
      href: onAddExpense ? undefined : '/cashflow/add?type=expense',
      variant: 'expense',
    },
    {
      id: 'investment',
      label: '记投资',
      icon: <TrendingUp className="h-5 w-5" />,
      onClick: onAddInvestment,
      href: onAddInvestment ? undefined : '/funds/transaction',
      variant: 'primary',
    },
    {
      id: 'goal',
      label: '新目标',
      icon: <Target className="h-5 w-5" />,
      onClick: onAddGoal,
      href: onAddGoal ? undefined : '/goals/add',
      variant: 'default',
    },
    {
      id: 'account',
      label: '添账户',
      icon: <PiggyBank className="h-5 w-5" />,
      href: '/accounts/add',
      variant: 'default',
    },
    {
      id: 'report',
      label: '查报表',
      icon: <FileText className="h-5 w-5" />,
      href: '/reports',
      variant: 'default',
    },
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">快捷操作</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => {
            const buttonContent = (
              <div className="flex flex-col items-center gap-2 py-2">
                <div
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    variantStyles[action.variant || 'default']
                  )}
                >
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {action.label}
                </span>
              </div>
            );

            if (action.href) {
              return (
                <Link
                  key={action.id}
                  to={action.href}
                  className="block hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {buttonContent}
                </Link>
              );
            }

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="hover:bg-gray-50 rounded-lg transition-colors w-full"
              >
                {buttonContent}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActionsCard;
