/**
 * Expense Category Pie Chart
 * Displays expense distribution by category
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
  CATEGORY_COLORS,
  TOOLTIP_STYLE,
  formatCurrency,
  formatPercentage,
} from './chartConfig';

interface ExpenseData {
  category: string;
  amount: number;
}

interface ExpenseCategoryChartProps {
  data: ExpenseData[] | Record<string, number>;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  maxCategories?: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export function ExpenseCategoryChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 50,
  outerRadius = 90,
  maxCategories = 8,
}: ExpenseCategoryChartProps) {
  const chartData = useMemo((): ChartDataItem[] => {
    let items: { name: string; value: number }[] = [];

    // Handle both array and object formats
    if (Array.isArray(data)) {
      items = data.map((item) => ({
        name: item.category,
        value: item.amount,
      }));
    } else {
      items = Object.entries(data).map(([name, value]) => ({
        name,
        value,
      }));
    }

    // Filter out zero values and sort by value
    items = items
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Group small categories into "Other" if exceeding max
    if (items.length > maxCategories) {
      const mainItems = items.slice(0, maxCategories - 1);
      const otherItems = items.slice(maxCategories - 1);
      const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);

      items = [...mainItems, { name: '其他', value: otherTotal }];
    }

    // Assign colors
    return items.map((item, index) => ({
      ...item,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [data, maxCategories]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无支出数据
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
      <ul className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry: { value: string; color: string }, index: number) => {
          const item = chartData.find((d) => d.name === entry.value);
          const percentage = item ? (item.value / total) * 100 : 0;

          return (
            <li key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 truncate">
                {entry.value}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {percentage.toFixed(0)}%
              </span>
            </li>
          );
        })}
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

export default ExpenseCategoryChart;
