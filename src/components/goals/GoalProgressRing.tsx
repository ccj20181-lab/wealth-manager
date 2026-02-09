/**
 * GoalProgressRing - Circular Progress Ring for Goals
 * Displays goal progress as an animated ring chart
 */

import { useMemo } from 'react';

interface GoalProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  default: {
    stroke: 'stroke-primary',
    text: 'text-primary',
  },
  success: {
    stroke: 'stroke-green-500',
    text: 'text-green-500',
  },
  warning: {
    stroke: 'stroke-yellow-500',
    text: 'text-yellow-500',
  },
  danger: {
    stroke: 'stroke-red-500',
    text: 'text-red-500',
  },
};

export function GoalProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  showPercentage = true,
  color = 'default',
}: GoalProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const { circumference, offset, radius, center } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = size / 2;
    const circ = 2 * Math.PI * r;
    const off = circ - (normalizedProgress / 100) * circ;

    return {
      radius: r,
      center: c,
      circumference: circ,
      offset: off,
    };
  }, [size, strokeWidth, normalizedProgress]);

  const colors = colorMap[color];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.stroke} transition-all duration-500 ease-out`}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${colors.text}`}>
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default GoalProgressRing;
