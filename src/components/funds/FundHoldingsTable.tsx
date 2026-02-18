/**
 * FundHoldingsTable - Fund Holdings List
 * Shows holdings with sorting and details
 */

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/components/charts';
import type { FundReturn } from '@/types/database';

interface FundHoldingsTableProps {
  returns: FundReturn[];
  isLoading?: boolean;
}

type SortField = 'fund_name' | 'current_value' | 'profit_loss' | 'return_rate';
type SortDirection = 'asc' | 'desc';

function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function FundHoldingsTable({ returns, isLoading }: FundHoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('current_value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    if (!returns) return [];

    return [...returns].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'fund_name':
          compareValue = a.fund_name.localeCompare(b.fund_name);
          break;
        case 'current_value':
          compareValue = a.current_value - b.current_value;
          break;
        case 'profit_loss':
          compareValue = a.profit_loss - b.profit_loss;
          break;
        case 'return_rate':
          compareValue = a.return_rate - b.return_rate;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [returns, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>持仓明细</CardTitle>
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

  if (!returns || returns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>持仓明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无持仓数据，添加第一笔基金交易吧！
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>持仓明细</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSort('fund_name')}
                  >
                    基金名称
                    <SortIcon field="fund_name" />
                  </Button>
                </th>
                <th className="text-right py-3 px-2">
                  <span className="font-medium text-sm">份额</span>
                </th>
                <th className="text-right py-3 px-2">
                  <span className="font-medium text-sm">成本</span>
                </th>
                <th className="text-right py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSort('current_value')}
                  >
                    市值
                    <SortIcon field="current_value" />
                  </Button>
                </th>
                <th className="text-right py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSort('profit_loss')}
                  >
                    收益
                    <SortIcon field="profit_loss" />
                  </Button>
                </th>
                <th className="text-right py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleSort('return_rate')}
                  >
                    收益率
                    <SortIcon field="return_rate" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((holding) => {
                const isProfit = holding.profit_loss >= 0;
                return (
                  <tr key={holding.holding_id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">{holding.fund_name}</div>
                        <div className="text-xs text-muted-foreground">{holding.fund_code}</div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-sm">
                      {holding.shares.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm">
                      {formatCurrency(holding.cost_basis)}
                    </td>
                    <td className="text-right py-3 px-2 text-sm font-medium">
                      {formatCurrency(holding.current_value)}
                    </td>
                    <td className={`text-right py-3 px-2 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(holding.profit_loss)}
                    </td>
                    <td className={`text-right py-3 px-2 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(holding.return_rate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default FundHoldingsTable;
