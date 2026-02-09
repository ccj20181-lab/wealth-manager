/**
 * AddTransactionDialog - Add Fund Transaction Dialog
 * Form for adding buy/sell/dividend transactions
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FundTransactionType } from '@/types/database';

const transactionSchema = z.object({
  fund_id: z.string().min(1, 'Please select a fund'),
  type: z.enum(['buy', 'sell', 'dividend', 'split'] as const),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  shares: z.number().optional(),
  nav: z.number().optional(),
  fee: z.number().min(0).optional(),
  transaction_date: z.string().min(1, 'Please select a date'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const typeOptions: { value: FundTransactionType; label: string }[] = [
  { value: 'buy', label: '买入' },
  { value: 'sell', label: '卖出' },
  { value: 'dividend', label: '分红' },
  { value: 'split', label: '拆分' },
];

export function AddTransactionDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddTransactionDialogProps) {
  const [selectedType, setSelectedType] = useState<FundTransactionType>('buy');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'buy',
      fee: 0,
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleTypeChange = (type: FundTransactionType) => {
    setSelectedType(type);
    setValue('type', type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>添加交易记录</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">交易类型</label>
              <div className="flex gap-2">
                {typeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={selectedType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Fund ID - In production, this would be a search/select component */}
            <div className="space-y-2">
              <label htmlFor="fund_id" className="text-sm font-medium">
                基金代码
              </label>
              <Input
                id="fund_id"
                placeholder="输入基金代码，如 000001"
                {...register('fund_id')}
              />
              {errors.fund_id && (
                <p className="text-sm text-destructive">{errors.fund_id.message}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                金额
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Shares */}
            {(selectedType === 'buy' || selectedType === 'sell') && (
              <div className="space-y-2">
                <label htmlFor="shares" className="text-sm font-medium">
                  份额
                </label>
                <Input
                  id="shares"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('shares', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* NAV */}
            {(selectedType === 'buy' || selectedType === 'sell') && (
              <div className="space-y-2">
                <label htmlFor="nav" className="text-sm font-medium">
                  净值
                </label>
                <Input
                  id="nav"
                  type="number"
                  step="0.0001"
                  placeholder="1.0000"
                  {...register('nav', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* Fee */}
            <div className="space-y-2">
              <label htmlFor="fee" className="text-sm font-medium">
                手续费
              </label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('fee', { valueAsNumber: true })}
              />
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <label htmlFor="transaction_date" className="text-sm font-medium">
                交易日期
              </label>
              <Input
                id="transaction_date"
                type="date"
                {...register('transaction_date')}
              />
              {errors.transaction_date && (
                <p className="text-sm text-destructive">{errors.transaction_date.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                备注
              </label>
              <Input
                id="notes"
                placeholder="可选备注..."
                {...register('notes')}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-4">
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

export default AddTransactionDialog;
