/**
 * TransactionForm - Add/Edit Transaction Dialog
 * Form for creating or editing cashflow transactions
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from './CategorySelector';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { CashflowCategory, CashflowTransactionInsert } from '@/types/database';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category_id: z.string().optional(),
  amount: z.number().positive('金额必须大于0'),
  description: z.string().optional(),
  transaction_date: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CashflowTransactionInsert) => Promise<void>;
  categories: CashflowCategory[];
  defaultType?: 'income' | 'expense';
  isLoading?: boolean;
}

export function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  categories,
  defaultType = 'expense',
  isLoading = false,
}: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(defaultType);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCategoryId = watch('category_id');

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setValue('type', newType);
    setValue('category_id', undefined);
  };

  const handleCategorySelect = (category: CashflowCategory) => {
    setValue('category_id', category.id);
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit({
      type: data.type,
      category_id: data.category_id,
      amount: data.amount,
      description: data.description,
      transaction_date: data.transaction_date,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>记一笔</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                type === 'expense' && 'bg-red-500 hover:bg-red-600'
              )}
              onClick={() => handleTypeChange('expense')}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              支出
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                type === 'income' && 'bg-emerald-500 hover:bg-emerald-600'
              )}
              onClick={() => handleTypeChange('income')}
            >
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              收入
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">金额</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 text-2xl h-14"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>分类</Label>
            <CategorySelector
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
              type={type}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">日期</Label>
            <Input
              id="date"
              type="date"
              {...register('transaction_date')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">备注</Label>
            <Textarea
              id="description"
              placeholder="添加备注..."
              rows={2}
              {...register('description')}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionForm;
