/**
 * Cashflow Trend Bar Chart
 * Displays monthly income vs expense comparison
 */

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  CASHFLOW_COLORS,
  CHART_MARGINS,
  TOOLTIP_STYLE,
  formatCurrency,
} from './chartConfig';
import type { CashflowTrend } from '@/types/database';

interface CashflowTrendChartProps {
  data: CashflowTrend[];
  height?: number;
  showNetLine?: boolean;
  showLegend?: boolean;
  className?: string;
}

interface ChartDataPoint {
  month: string;
  displayMonth: string;
  income: number;
  expense: number;
  net: number;
}

export function CashflowTrendChart({
  data,
  height = 300,
  showNetLine = true,
  showLegend = true,
  className,
}: CashflowTrendChartProps) {
  const chartData = useMemo((): ChartDataPoint[] => {
    return data.map((item) => {
      const [, month] = item.year_month.split('-');
      return {
        month: item.year_month,
        displayMonth: `${parseInt(month)}月`,
        income: item.total_income,
        expense: item.total_expense,
        net: item.net_cashflow,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无收支数据
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={TOOLTIP_STYLE.contentStyle}>
        <p style={TOOLTIP_STYLE.labelStyle}>{label}</p>
        {payload.map((item, index) => {
          const labels: Record<string, string> = {
            income: '收入',
            expense: '支出',
            net: '净收入',
          };
          return (
            <p key={index} style={{ ...TOOLTIP_STYLE.itemStyle, color: item.color }}>
              {labels[item.dataKey]}: {formatCurrency(item.value)}
            </p>
          );
        })}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;

    const labels: Record<string, string> = {
      income: '收入',
      expense: '支出',
      net: '净收入',
    };

    return (
      <ul className="flex justify-center gap-6 mt-4">
        {payload.map((entry: { value: string; color: string }, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {labels[entry.value] || entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={CHART_MARGINS.withAxis}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="displayMonth"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={renderLegend} />}
        <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
        <Bar
          dataKey="income"
          fill={CASHFLOW_COLORS.income}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
        <Bar
          dataKey="expense"
          fill={CASHFLOW_COLORS.expense}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
        {showNetLine && (
          <Line
            type="monotone"
            dataKey="net"
            stroke={CASHFLOW_COLORS.net}
            strokeWidth={2}
            dot={{ r: 4, fill: CASHFLOW_COLORS.net, strokeWidth: 0 }}
            animationDuration={800}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
    </div>
  );
}

export default CashflowTrendChart;
