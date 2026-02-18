/**
 * AssetOverviewCard - Asset Distribution Overview
 * Shows total assets with allocation pie chart and breakdown
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AssetAllocationChart, ASSET_LABELS, formatCurrency } from '@/components/charts';
import { cn } from '@/lib/utils';
import type { NetWorthBreakdown } from '@/types/database';

interface AssetOverviewCardProps {
  totalAssets: number;
  breakdown: NetWorthBreakdown;
  className?: string;
}

const ASSET_COLORS: Record<string, string> = {
  bank: 'bg-blue-500',
  fund: 'bg-purple-500',
  gold: 'bg-amber-500',
  pension: 'bg-emerald-500',
  insurance: 'bg-pink-500',
  other: 'bg-gray-500',
};

export function AssetOverviewCard({
  totalAssets,
  breakdown,
  className,
}: AssetOverviewCardProps) {
  // Calculate percentages
  const breakdownItems = Object.entries(breakdown)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      key,
      label: ASSET_LABELS[key] || key,
      value,
      percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0,
      colorClass: ASSET_COLORS[key] || ASSET_COLORS.other,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">资产概览</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total Assets */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">总资产</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        {/* Pie Chart */}
        <div className="h-[200px] mb-4">
          <AssetAllocationChart
            data={breakdown}
            height={200}
            showLegend={false}
            innerRadius={50}
            outerRadius={80}
          />
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {breakdownItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('w-3 h-3 rounded-full', item.colorClass)} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}

          {breakdownItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无资产数据
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AssetOverviewCard;
