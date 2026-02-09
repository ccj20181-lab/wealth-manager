/**
 * TransactionCard - Single Transaction Display
 * Shows transaction details with category icon and amount
 */

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/charts';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import type { CashflowTransaction } from '@/types/database';

interface TransactionCardProps {
  transaction: CashflowTransaction;
  onClick?: () => void;
  className?: string;
}

const TYPE_CONFIG = {
  income: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    sign: '+',
  },
  expense: {
    icon: ArrowUpRight,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    sign: '-',
  },
  transfer: {
    icon: ArrowRightLeft,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    sign: '',
  },
};

export function TransactionCard({
  transaction,
  onClick,
  className,
}: TransactionCardProps) {
  const config = TYPE_CONFIG[transaction.type];
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {transaction.category?.name || transaction.description || '未分类'}
          </p>
          <p className="text-sm text-muted-foreground">
            {transaction.description && transaction.category?.name
              ? transaction.description
              : formatDate(transaction.transaction_date)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn('font-semibold', config.color)}>
          {config.sign}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.transaction_date)}
        </p>
      </div>
    </div>
  );
}

export default TransactionCard;
