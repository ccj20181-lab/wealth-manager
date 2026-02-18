/**
 * BudgetManagerDialog - 预算管理（MVP）
 * 目标：让“预算执行”不再只是展示，而是可配置、可维护。
 */

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Budget, CashflowCategory } from '@/types/database';
import { formatCurrency } from '@/components/charts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgets: Budget[];
  categories: CashflowCategory[];
  onCreate: (payload: { category_id: string; amount: number; period: 'monthly'; alert_threshold: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

function parseAmount(input: string): number {
  const n = Number(String(input).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export function BudgetManagerDialog({
  open,
  onOpenChange,
  budgets,
  categories,
  onCreate,
  onDelete,
  isUpdating = false,
}: Props) {
  const expenseCategories = useMemo(() => {
    return categories
      .filter((c) => c.type === 'expense' && !c.parent_id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('2000');
  const [threshold, setThreshold] = useState<string>('0.8');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!categoryId) {
      setError('请选择预算分类');
      return;
    }
    const amt = parseAmount(amount);
    if (amt <= 0) {
      setError('预算金额必须大于 0');
      return;
    }
    const t = Number(threshold);
    const alert = Number.isFinite(t) ? Math.min(0.95, Math.max(0.5, t)) : 0.8;

    await onCreate({
      category_id: categoryId,
      amount: amt,
      period: 'monthly',
      alert_threshold: alert,
    });
    setCategoryId('');
  };

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => (a.category?.name || '').localeCompare(b.category?.name || ''));
  }, [budgets]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>预算设置</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">分类</Label>
            <select
              id="category"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">选择支出分类...</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="amount">月度预算</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">预警阈值</Label>
              <Input
                id="threshold"
                type="number"
                step="0.05"
                min="0.5"
                max="0.95"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button onClick={submit} disabled={isUpdating}>
              {isUpdating ? '保存中...' : '新增预算'}
            </Button>
          </DialogFooter>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium mb-2">已设置预算</div>
          {sortedBudgets.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">暂无预算</div>
          ) : (
            <div className="space-y-2">
              {sortedBudgets.map((b: Budget) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/60">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.category?.name || '未分类'}</div>
                    <div className="text-xs text-muted-foreground">
                      月度预算 {formatCurrency(b.amount)} · 预警 {(b.alert_threshold * 100).toFixed(0)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      if (!window.confirm(`确定删除「${b.category?.name || '预算'}」吗？`)) return;
                      await onDelete(b.id);
                    }}
                    disabled={isUpdating}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BudgetManagerDialog;

