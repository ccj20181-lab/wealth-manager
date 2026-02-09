/**
 * TransactionList - Grouped Transaction List
 * Displays transactions grouped by date with filtering
 */

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionCard } from './TransactionCard';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/charts';
import { ChevronDown } from 'lucide-react';
import type { CashflowTransaction, CashflowType } from '@/types/database';

interface TransactionListProps {
  transactions: CashflowTransaction[];
  onTransactionClick?: (transaction: CashflowTransaction) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

interface GroupedTransactions {
  date: string;
  displayDate: string;
  transactions: CashflowTransaction[];
  income: number;
  expense: number;
}

type FilterType = 'all' | CashflowType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
  { value: 'transfer', label: '转账' },
];

export function TransactionList({
  transactions,
  onTransactionClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  // Group transactions by date
  const groupedTransactions = useMemo((): GroupedTransactions[] => {
    const groups = new Map<string, GroupedTransactions>();

    filteredTransactions.forEach((transaction) => {
      const date = transaction.transaction_date;

      if (!groups.has(date)) {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let displayDate: string;
        if (d.toDateString() === today.toDateString()) {
          displayDate = '今天';
        } else if (d.toDateString() === yesterday.toDateString()) {
          displayDate = '昨天';
        } else {
          displayDate = d.toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          });
        }

        groups.set(date, {
          date,
          displayDate,
          transactions: [],
          income: 0,
          expense: 0,
        });
      }

      const group = groups.get(date)!;
      group.transactions.push(transaction);
      if (transaction.type === 'income') {
        group.income += transaction.amount;
      } else if (transaction.type === 'expense') {
        group.expense += transaction.amount;
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [filteredTransactions]);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">交易记录</CardTitle>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  filter === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedTransactions.length > 0 ? (
          <>
            {groupedTransactions.map((group) => (
              <div key={group.date}>
                {/* Date Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {group.displayDate}
                  </span>
                  <div className="flex gap-4 text-sm">
                    {group.income > 0 && (
                      <span className="text-emerald-600">
                        +{formatCurrency(group.income)}
                      </span>
                    )}
                    {group.expense > 0 && (
                      <span className="text-red-600">
                        -{formatCurrency(group.expense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {group.transactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => onTransactionClick?.(transaction)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '加载中...' : '加载更多'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>暂无交易记录</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionList;
