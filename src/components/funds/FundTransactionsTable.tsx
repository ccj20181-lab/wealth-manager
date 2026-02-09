/**
 * FundTransactionsTable - Fund Transactions List
 * Shows transaction history with filters
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FundTransaction, FundTransactionType } from '@/types/database';

interface FundTransactionsTableProps {
  transactions: FundTransaction[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const typeLabels: Record<FundTransactionType, string> = {
  buy: '买入',
  sell: '卖出',
  dividend: '分红',
  split: '拆分',
};

const typeColors: Record<FundTransactionType, string> = {
  buy: 'bg-green-100 text-green-800',
  sell: 'bg-red-100 text-red-800',
  dividend: 'bg-blue-100 text-blue-800',
  split: 'bg-purple-100 text-purple-800',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}

export function FundTransactionsTable({
  transactions,
  isLoading,
  onDelete,
  isDeleting
}: FundTransactionsTableProps) {
  const [filterType, setFilterType] = useState<FundTransactionType | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredTransactions = transactions?.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = !searchKeyword ||
      t.fund?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.fund?.code?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>交易记录</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="搜索基金..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-40"
            />
            <div className="flex gap-1">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                全部
              </Button>
              <Button
                variant={filterType === 'buy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('buy')}
              >
                买入
              </Button>
              <Button
                variant={filterType === 'sell' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('sell')}
              >
                卖出
              </Button>
              <Button
                variant={filterType === 'dividend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('dividend')}
              >
                分红
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions?.length === 0 ? '暂无交易记录' : '没有符合筛选条件的记录'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium">日期</th>
                  <th className="text-left py-3 px-2 text-sm font-medium">基金</th>
                  <th className="text-center py-3 px-2 text-sm font-medium">类型</th>
                  <th className="text-right py-3 px-2 text-sm font-medium">份额</th>
                  <th className="text-right py-3 px-2 text-sm font-medium">净值</th>
                  <th className="text-right py-3 px-2 text-sm font-medium">金额</th>
                  <th className="text-right py-3 px-2 text-sm font-medium">手续费</th>
                  <th className="text-center py-3 px-2 text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 text-sm">
                      {format(new Date(transaction.transaction_date), 'yyyy-MM-dd')}
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-sm">{transaction.fund?.name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{transaction.fund?.code || '-'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${typeColors[transaction.type]}`}>
                        {typeLabels[transaction.type]}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 text-sm">
                      {transaction.shares?.toFixed(2) || '-'}
                    </td>
                    <td className="text-right py-3 px-2 text-sm">
                      {transaction.nav?.toFixed(4) || '-'}
                    </td>
                    <td className="text-right py-3 px-2 text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm text-muted-foreground">
                      {formatCurrency(transaction.fee)}
                    </td>
                    <td className="text-center py-3 px-2">
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(transaction.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FundTransactionsTable;
