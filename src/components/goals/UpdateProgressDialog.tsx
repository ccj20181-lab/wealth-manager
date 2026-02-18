/**
 * UpdateProgressDialog - Update Goal Progress Dialog
 * Quick dialog to update current amount for a goal
 */

import { useState } from 'react';
import { Loader2, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/components/charts';
import type { GoalProgress } from '@/types/database';

interface UpdateProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, currentAmount: number) => Promise<void>;
  isSubmitting?: boolean;
  goal: GoalProgress | null;
}

export function UpdateProgressDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  goal,
}: UpdateProgressDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<'set' | 'add'>('add');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) return;

    const finalAmount = mode === 'add'
      ? goal.current_amount + numAmount
      : numAmount;

    await onSubmit(goal.goal_id, finalAmount);
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const remaining = goal.target_amount - goal.current_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              更新进度
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium">{goal.goal_name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                当前: {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                还需: {formatCurrency(Math.max(0, remaining))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'add' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMode('add')}
              >
                增加金额
              </Button>
              <Button
                type="button"
                variant={mode === 'set' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setMode('set')}
              >
                设置总额
              </Button>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                {mode === 'add' ? '增加金额' : '当前总额'}
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
              {mode === 'add' && amount && !isNaN(parseFloat(amount)) && (
                <p className="text-sm text-muted-foreground">
                  更新后: {formatCurrency(goal.current_amount + parseFloat(amount))}
                </p>
              )}
            </div>

            {/* Quick Add Buttons */}
            {mode === 'add' && (
              <div className="flex gap-2 flex-wrap">
                {[100, 500, 1000, 5000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(val.toString())}
                  >
                    +{val}
                  </Button>
                ))}
                {remaining > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(remaining.toString())}
                  >
                    补齐差额
                  </Button>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !amount || isNaN(parseFloat(amount))}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  '确认更新'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdateProgressDialog;
