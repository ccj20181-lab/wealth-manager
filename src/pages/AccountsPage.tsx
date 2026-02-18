/**
 * AccountsPage - 资产账户管理
 * 覆盖中国用户常见账户：银行卡、支付宝/微信、现金、基金账户等（以“资产账户”统一建模）
 */

import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Landmark, WalletCards, PiggyBank, Shield, MoreHorizontal } from 'lucide-react';
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from '@/hooks';
import type { AssetAccount, AssetAccountInsert, AccountType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/components/charts';
import { cn } from '@/lib/utils';

const ACCOUNT_TYPE_META: Record<AccountType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  bank: { label: '现金/银行', icon: Landmark },
  fund: { label: '基金账户', icon: WalletCards },
  pension: { label: '养老金', icon: PiggyBank },
  insurance: { label: '保险', icon: Shield },
  other: { label: '其他', icon: MoreHorizontal },
};

type AccountDraft = {
  name: string;
  type: AccountType;
  balance: string;
  institution: string;
  notes: string;
  is_active: boolean;
};

function toDraft(a?: AssetAccount | null): AccountDraft {
  return {
    name: a?.name ?? '',
    type: a?.type ?? 'bank',
    balance: a ? String(a.balance ?? 0) : '0',
    institution: a?.institution ?? '',
    notes: a?.notes ?? '',
    is_active: a?.is_active ?? true,
  };
}

function parseBalance(input: string): number {
  const n = Number(String(input).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export function AccountsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [editing, setEditing] = useState<AssetAccount | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AccountDraft>(() => toDraft(null));

  const totals = useMemo(() => {
    const active = accounts.filter((a) => a.is_active);
    const total = active.reduce((sum, a) => sum + (a.balance ?? 0), 0);
    return { total, activeCount: active.length, allCount: accounts.length };
  }, [accounts]);

  const openCreate = () => {
    setEditing(null);
    setDraft(toDraft(null));
    setOpen(true);
  };

  const openEdit = (a: AssetAccount) => {
    setEditing(a);
    setDraft(toDraft(a));
    setOpen(true);
  };

  const submit = async () => {
    const payload: AssetAccountInsert = {
      name: draft.name.trim(),
      type: draft.type,
      balance: parseBalance(draft.balance),
      institution: draft.institution.trim() || null,
      notes: draft.notes.trim() || null,
      is_active: draft.is_active,
    };

    if (!payload.name) return;

    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        updates: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setOpen(false);

    if (location.pathname.endsWith('/accounts/add')) {
      navigate('/accounts', { replace: true });
    }
  };

  const onDelete = async (a: AssetAccount) => {
    if (!window.confirm(`确定删除账户「${a.name}」吗？该操作不可恢复。`)) return;
    await deleteMutation.mutateAsync(a.id);
  };

  useEffect(() => {
    if (location.pathname.endsWith('/accounts/add')) {
      openCreate();
    }
    // 只在首次进入该路由时触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">资产账户</h1>
          <p className="text-muted-foreground">把银行卡、支付宝/微信、现金、基金账户统一管理</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加账户
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">账户概览</CardTitle>
          <CardDescription>
            启用 {totals.activeCount} 个账户，共 {totals.allCount} 个
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{formatCurrency(totals.total)}</div>
          <div className="mt-1 text-sm text-muted-foreground">启用账户余额合计</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-40 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : accounts.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>还没有账户，先添加一个常用账户开始吧。</p>
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                添加账户
              </Button>
            </CardContent>
          </Card>
        ) : (
          accounts.map((a) => {
            const meta = ACCOUNT_TYPE_META[a.type];
            const Icon = meta.icon;
            return (
              <Card key={a.id} className={cn(!a.is_active && 'opacity-60')}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <span className="truncate">{a.name}</span>
                      </CardTitle>
                      <CardDescription className="truncate">
                        {meta.label}
                        {a.institution ? ` · ${a.institution}` : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="编辑">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(a)}
                        title="删除"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(a.balance ?? 0)}</div>
                  {a.notes && <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.notes}</div>}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑账户' : '添加账户'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">账户名称</Label>
              <Input
                id="name"
                placeholder="例如：招商银行储蓄卡 / 支付宝余额 / 现金"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">账户类型</Label>
              <select
                id="type"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as AccountType }))}
              >
                {Object.entries(ACCOUNT_TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                提示：支付宝/微信/现金可放在“现金/银行”或“其他”，看你的习惯。
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="balance">余额</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={draft.balance}
                onChange={(e) => setDraft((d) => ({ ...d, balance: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="institution">机构/平台（选填）</Label>
              <Input
                id="institution"
                placeholder="例如：招行 / 支付宝 / 微信支付"
                value={draft.institution}
                onChange={(e) => setDraft((d) => ({ ...d, institution: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">备注（选填）</Label>
              <Input
                id="notes"
                placeholder="例如：工资卡；每月 15 号发薪"
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
              />
              启用该账户（参与总资产统计）
            </label>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending || !draft.name.trim()}
            >
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountsPage;
