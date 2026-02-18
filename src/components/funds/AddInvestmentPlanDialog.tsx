/**
 * AddInvestmentPlanDialog - 新建定投计划
 * 为个人使用场景做的 MVP：可通过基金代码+名称创建/选择基金，再配置频率与扣款日
 */

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InvestmentFrequency, InvestmentPlanInsert } from '@/types/database';
import type { AssetAccount } from '@/types/database';
import { fundsApi } from '@/services/api/funds';

const schema = z.object({
  fund_code: z.string().min(1, '请输入基金代码'),
  fund_name: z.string().optional(),
  amount: z.number().min(1, '金额必须大于 0'),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly'] as const),
  next_date: z.string().min(1, '请选择开始日期'),
  account_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvestmentPlanInsert) => Promise<void>;
  isSubmitting?: boolean;
  accounts?: AssetAccount[];
}

const frequencyOptions: Array<{ value: InvestmentFrequency; label: string }> = [
  { value: 'monthly', label: '每月' },
  { value: 'weekly', label: '每周' },
  { value: 'biweekly', label: '每两周' },
  { value: 'daily', label: '每日' },
];

export function AddInvestmentPlanDialog({ isOpen, onClose, onSubmit, isSubmitting, accounts = [] }: Props) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequency: 'monthly',
      amount: 300,
      next_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const fundCode = watch('fund_code');
  const lookup = async () => {
    setError(null);
    const code = (fundCode || '').trim();
    if (!code) return;
    try {
      const f = await fundsApi.getFundByCode(code);
      if (!f) {
        setError('未找到该基金：可填写名称后创建');
        return;
      }
      setValue('fund_name', f.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : '基金查询失败');
    }
  };

  const submit = async (data: FormData) => {
    setError(null);
    try {
      const fund = await fundsApi.ensureFund({ code: data.fund_code, name: data.fund_name });
      const d = new Date(data.next_date);
      const dayOfMonth = d.getDate();
      const dayOfWeek = d.getDay(); // 0..6

      await onSubmit({
        fund_id: fund.id,
        account_id: data.account_id || null,
        amount: data.amount,
        frequency: data.frequency,
        next_date: data.next_date,
        day_of_month: data.frequency === 'monthly' ? dayOfMonth : null,
        day_of_week: data.frequency === 'weekly' || data.frequency === 'biweekly' ? dayOfWeek : null,
        is_active: true,
      });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>新建定投</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700 border border-amber-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">基金</label>
              <div className="flex gap-2">
                <Input placeholder="基金代码，如 000001" {...register('fund_code')} />
                <Button type="button" variant="outline" onClick={lookup}>
                  查询
                </Button>
              </div>
              <Input placeholder="基金名称（未收录时用于创建）" {...register('fund_name')} />
              {errors.fund_code && <p className="text-sm text-destructive">{errors.fund_code.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">扣款账户（选填）</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                {...register('account_id')}
              >
                <option value="">不指定</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">金额</label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">频率</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  {...register('frequency')}
                >
                  {frequencyOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">开始日期</label>
              <Input type="date" {...register('next_date')} />
              {errors.next_date && <p className="text-sm text-destructive">{errors.next_date.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddInvestmentPlanDialog;

