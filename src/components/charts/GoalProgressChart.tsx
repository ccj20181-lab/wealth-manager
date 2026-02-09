/**
 * Goal Progress Ring Chart
 * Displays single goal completion progress
 */

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  PROGRESS_COLORS,
  getProgressColor,
  formatCurrency,
  formatPercentage,
} from './chartConfig';

interface GoalProgressChartProps {
  currentAmount: number;
  targetAmount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showAmount?: boolean;
  goalName?: string;
}

const SIZE_CONFIG = {
  sm: { height: 80, innerRadius: 25, outerRadius: 35, fontSize: 'text-xs' },
  md: { height: 120, innerRadius: 40, outerRadius: 55, fontSize: 'text-sm' },
  lg: { height: 180, innerRadius: 60, outerRadius: 80, fontSize: 'text-base' },
} as const;

export function GoalProgressChart({
  currentAmount,
  targetAmount,
  size = 'md',
  showLabel = true,
  showAmount = false,
  goalName,
}: GoalProgressChartProps) {
  const config = SIZE_CONFIG[size];

  const { percentage, progressColor, chartData } = useMemo(() => {
    const pct = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const clampedPct = Math.min(pct, 100);
    const color = getProgressColor(pct);

    return {
      percentage: pct,
      progressColor: color,
      chartData: [
        { name: 'completed', value: clampedPct },
        { name: 'remaining', value: Math.max(100 - clampedPct, 0) },
      ],
    };
  }, [currentAmount, targetAmount]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.height, height: config.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              <Cell fill={progressColor} strokeWidth={0} />
              <Cell fill={PROGRESS_COLORS.background} strokeWidth={0} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-semibold ${config.fontSize}`} style={{ color: progressColor }}>
              {formatPercentage(Math.min(percentage, 100))}
            </span>
          </div>
        )}
      </div>

      {/* Goal info */}
      {(goalName || showAmount) && (
        <div className="mt-2 text-center">
          {goalName && (
            <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
              {goalName}
            </p>
          )}
          {showAmount && (
            <p className="text-xs text-gray-500">
              {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Linear progress variant for lists
interface GoalProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  showPercentage?: boolean;
  showAmount?: boolean;
  height?: number;
}

export function GoalProgressBar({
  currentAmount,
  targetAmount,
  showPercentage = true,
  showAmount = true,
  height = 8,
}: GoalProgressBarProps) {
  const percentage = useMemo(() => {
    return targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  }, [currentAmount, targetAmount]);

  const progressColor = getProgressColor(percentage);
  const clampedPercentage = Math.min(percentage, 100);

  return (
    <div className="w-full">
      {/* Info row */}
      {(showPercentage || showAmount) && (
        <div className="flex justify-between items-center mb-1">
          {showAmount && (
            <span className="text-sm text-gray-600">
              {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
            </span>
          )}
          {showPercentage && (
            <span
              className="text-sm font-medium"
              style={{ color: progressColor }}
            >
              {formatPercentage(percentage)}
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: PROGRESS_COLORS.background,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
    </div>
  );
}

export default GoalProgressChart;
