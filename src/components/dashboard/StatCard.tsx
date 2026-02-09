/**
 * StatCard - Dashboard Statistics Card
 * Displays a single key metric with icon, value, and optional trend
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  href?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    icon: 'bg-gray-100 text-gray-600',
    trend: {
      up: 'text-emerald-600',
      down: 'text-red-600',
    },
  },
  primary: {
    icon: 'bg-blue-100 text-blue-600',
    trend: {
      up: 'text-emerald-600',
      down: 'text-red-600',
    },
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600',
    trend: {
      up: 'text-emerald-600',
      down: 'text-red-600',
    },
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600',
    trend: {
      up: 'text-emerald-600',
      down: 'text-red-600',
    },
  },
  danger: {
    icon: 'bg-red-100 text-red-600',
    trend: {
      up: 'text-emerald-600',
      down: 'text-red-600',
    },
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  href,
  className,
  variant = 'default',
}: StatCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>

            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.value >= 0 ? (
                  <TrendingUp className={cn('h-4 w-4', styles.trend.up)} />
                ) : (
                  <TrendingDown className={cn('h-4 w-4', styles.trend.down)} />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.value >= 0 ? styles.trend.up : styles.trend.down
                  )}
                >
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
                {trend.label && (
                  <span className="text-sm text-muted-foreground">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {icon && (
            <div className={cn('rounded-lg p-3', styles.icon)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default StatCard;
