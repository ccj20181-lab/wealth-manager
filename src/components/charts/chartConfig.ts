/**
 * Wealth Manager - Chart Configuration
 * Unified chart theme and styling
 */

// Asset type colors - harmonious palette
export const ASSET_COLORS = {
  bank: '#3B82F6',      // Blue - Cash/Bank
  fund: '#8B5CF6',      // Purple - Fund Investment
  gold: '#F59E0B',      // Amber - Gold
  pension: '#10B981',   // Emerald - Pension
  insurance: '#EC4899', // Pink - Insurance
  other: '#6B7280',     // Gray - Other
} as const;

// Cashflow colors
export const CASHFLOW_COLORS = {
  income: '#10B981',    // Emerald - Income
  expense: '#EF4444',   // Red - Expense
  net: '#3B82F6',       // Blue - Net
  transfer: '#6B7280',  // Gray - Transfer
} as const;

// Expense category colors - extended palette
export const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#A855F7', // Violet
] as const;

// Goal progress colors
export const PROGRESS_COLORS = {
  low: '#EF4444',       // Red - 0-30%
  medium: '#F59E0B',    // Amber - 30-70%
  high: '#10B981',      // Emerald - 70-100%
  complete: '#3B82F6',  // Blue - 100%
  background: '#E5E7EB', // Gray-200 - Background
} as const;

// Get progress color based on percentage
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return PROGRESS_COLORS.complete;
  if (percentage >= 70) return PROGRESS_COLORS.high;
  if (percentage >= 30) return PROGRESS_COLORS.medium;
  return PROGRESS_COLORS.low;
};

// Common chart margins
export const CHART_MARGINS = {
  small: { top: 5, right: 5, bottom: 5, left: 5 },
  medium: { top: 10, right: 10, bottom: 10, left: 10 },
  large: { top: 20, right: 20, bottom: 20, left: 20 },
  withAxis: { top: 20, right: 20, bottom: 20, left: 40 },
} as const;

// Tooltip style
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '12px',
  },
  labelStyle: {
    color: '#374151',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: '#6B7280',
    padding: '2px 0',
  },
} as const;

// Format currency for charts
export const formatCurrency = (value: number): string => {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`;
  }
  return `¥${value.toLocaleString()}`;
};

// Format percentage for charts
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Asset type labels in Chinese
export const ASSET_LABELS: Record<string, string> = {
  bank: '现金/银行',
  fund: '基金投资',
  gold: '黄金',
  pension: '养老金',
  insurance: '保险',
  other: '其他',
};

// Responsive breakpoints for charts
export const CHART_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Animation config
export const ANIMATION_CONFIG = {
  duration: 800,
  easing: 'ease-out',
} as const;
