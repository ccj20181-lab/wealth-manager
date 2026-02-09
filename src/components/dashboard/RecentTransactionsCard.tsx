/**
 * RecentTransactionsCard - Recent Transaction List
 * Displays latest cashflow transactions
 */

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/charts';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, ChevronRight } from 'lucide-react';
import type { CashflowTransaction } from '@/types/database';

interface RecentTransactionsCardProps {
  transactions: CashflowTransaction[];
  maxItems?: number;
  className?: string;
}

const TYPE_CONFIG = {
  income: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    label: '收入',
  },
  expense: {
    icon: ArrowUpRight,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: '支出',
  },
  transfer: {
    icon: ArrowRightLeft,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: '转账',
  },
};

export function RecentTransactionsCard({
  transactions,
  maxItems = 5,
  className,
}: RecentTransactionsCardProps) {
  const displayTransactions = transactions.slice(0, maxItems);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">近期交易</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cashflow" className="flex items-center gap-1">
              查看全部
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayTransactions.length > 0 ? (
          <div className="space-y-3">
            {displayTransactions.map((transaction) => {
              const config = TYPE_CONFIG[transaction.type];
              const Icon = config.icon;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.bgColor)}>
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.category?.name || config.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.description || formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        transaction.type === 'income' && 'text-emerald-600',
                        transaction.type === 'expense' && 'text-red-600',
                        transaction.type === 'transfer' && 'text-blue-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>暂无交易记录</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/cashflow/add">记一笔</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentTransactionsCard;
