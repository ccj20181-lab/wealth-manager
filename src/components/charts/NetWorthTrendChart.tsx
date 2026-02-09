/**
 * Net Worth Trend Line Chart
 * Displays historical net worth changes
 */

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  CHART_MARGINS,
  TOOLTIP_STYLE,
  formatCurrency,
} from './chartConfig';
import type { NetWorthSnapshot } from '@/types/database';

type TimeRange = '30d' | '90d' | '1y';

interface NetWorthTrendChartProps {
  data: NetWorthSnapshot[];
  height?: number;
  showTimeRangeSelector?: boolean;
  defaultTimeRange?: TimeRange;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '30d': '30天',
  '90d': '90天',
  '1y': '1年',
};

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export function NetWorthTrendChart({
  data,
  height = 300,
  showTimeRangeSelector = true,
  defaultTimeRange = '90d',
}: NetWorthTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);

  const chartData = useMemo((): ChartDataPoint[] => {
    const days = TIME_RANGE_DAYS[timeRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data
      .filter((item) => new Date(item.snapshot_date) >= cutoffDate)
      .map((item) => {
        const date = new Date(item.snapshot_date);
        return {
          date: item.snapshot_date,
          displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
          netWorth: item.net_worth,
          assets: item.total_assets,
          liabilities: item.total_liabilities,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, timeRange]);

  const stats = useMemo(() => {
    if (chartData.length < 2) return null;

    const first = chartData[0].netWorth;
    const last = chartData[chartData.length - 1].netWorth;
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;

    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无净值数据
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={TOOLTIP_STYLE.contentStyle}>
        <p style={TOOLTIP_STYLE.labelStyle}>{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={TOOLTIP_STYLE.itemStyle}>
            净值: {formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {showTimeRangeSelector && (
        <div className="flex items-center justify-between mb-4">
          {stats && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">变化:</span>
              <span
                className={`text-sm font-medium ${
                  stats.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {stats.isPositive ? '+' : ''}
                {formatCurrency(stats.change)} ({stats.changePercent.toFixed(1)}%)
              </span>
            </div>
          )}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {TIME_RANGE_LABELS[range]}
              </button>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={CHART_MARGINS.withAxis}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="displayDate"
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
          <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default NetWorthTrendChart;
