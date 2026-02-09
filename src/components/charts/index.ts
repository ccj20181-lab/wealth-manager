/**
 * Wealth Manager - Charts Index
 * Re-export all chart components
 */

export { AssetAllocationChart } from './AssetAllocationChart';
export { NetWorthTrendChart } from './NetWorthTrendChart';
export { CashflowTrendChart } from './CashflowTrendChart';
export { ExpenseCategoryChart } from './ExpenseCategoryChart';
export { GoalProgressChart, GoalProgressBar } from './GoalProgressChart';

// Config exports
export {
  ASSET_COLORS,
  ASSET_LABELS,
  CASHFLOW_COLORS,
  CATEGORY_COLORS,
  PROGRESS_COLORS,
  CHART_MARGINS,
  TOOLTIP_STYLE,
  getProgressColor,
  formatCurrency,
  formatPercentage,
} from './chartConfig';
