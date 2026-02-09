/**
 * Asset Allocation Pie Chart
 * Displays asset distribution by type
 */

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ASSET_COLORS,
  ASSET_LABELS,
  TOOLTIP_STYLE,
  formatCurrency,
  formatPercentage,
} from './chartConfig';
import type { NetWorthBreakdown } from '@/types/database';

interface AssetAllocationChartProps {
  data: NetWorthBreakdown;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  key: string;
}

export function AssetAllocationChart({
  data,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  height = 300,
}: AssetAllocationChartProps) {
  const chartData = useMemo((): ChartDataItem[] => {
    const items: ChartDataItem[] = [];
    const keys = Object.keys(data) as (keyof NetWorthBreakdown)[];

    keys.forEach((key) => {
      const value = data[key];
      if (value > 0) {
        items.push({
          name: ASSET_LABELS[key] || key,
          value,
          color: ASSET_COLORS[key as keyof typeof ASSET_COLORS] || ASSET_COLORS.other,
          key,
        });
      }
    });

    // Sort by value descending
    return items.sort((a, b) => b.value - a.value);
  }, [data]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无资产数据
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;
    const percentage = (item.value / total) * 100;

    return (
      <div style={TOOLTIP_STYLE.contentStyle}>
        <p style={TOOLTIP_STYLE.labelStyle}>{item.name}</p>
        <p style={TOOLTIP_STYLE.itemStyle}>
          金额: {formatCurrency(item.value)}
        </p>
        <p style={TOOLTIP_STYLE.itemStyle}>
          占比: {formatPercentage(percentage)}
        </p>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;

    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: { value: string; color: string }, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={renderLegend} />}
      </PieChart>
    </ResponsiveContainer>
  );
}

export default AssetAllocationChart;
