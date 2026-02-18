/**
 * AddGoalDialog - Create/Edit Financial Goal Dialog
 * Form for adding or editing investment goals
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinancialGoal } from '@/types/database';

const goalSchema = z.object({
  name: z.string().min(1, '请输入目标名称'),
  target_amount: z.number().min(1, '目标金额必须大于 0'),
  current_amount: z.number().min(0).optional(),
  deadline: z.string().optional(),
  category: z.string().optional(),
  priority: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  isSubmitting?: boolean;
  editGoal?: FinancialGoal | null;
}

const categoryOptions = [
  { value: 'savings', label: '储蓄' },
  { value: 'investment', label: '投资' },
  { value: 'retirement', label: '退休' },
  { value: 'education', label: '教育' },
  { value: 'house', label: '房产' },
  { value: 'car', label: '汽车' },
  { value: 'travel', label: '旅行' },
  { value: 'emergency', label: '应急基金' },
  { value: 'other', label: '其他' },
];

const priorityOptions = [
  { value: 1, label: '最高' },
  { value: 2, label: '高' },
  { value: 3, label: '中等' },
  { value: 4, label: '低' },
  { value: 5, label: '最低' },
];

export function AddGoalDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editGoal,
}: AddGoalDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      priority: 3,
      current_amount: 0,
    },
  });

  useEffect(() => {
    if (editGoal) {
      setValue('name', editGoal.name);
      setValue('target_amount', editGoal.target_amount);
      setValue('current_amount', editGoal.current_amount);
      setValue('deadline', editGoal.deadline || '');
      setValue('category', editGoal.category || '');
      setValue('priority', editGoal.priority);
      setValue('notes', editGoal.notes || '');
    } else {
      reset({
        priority: 3,
        current_amount: 0,
      });
    }
  }, [editGoal, setValue, reset]);

  const handleFormSubmit = async (data: GoalFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editGoal ? '编辑目标' : '创建新目标'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Goal Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                目标名称 *
              </label>
              <Input
                id="name"
                placeholder="例如: 买车首付"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label htmlFor="target_amount" className="text-sm font-medium">
                目标金额 *
              </label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('target_amount', { valueAsNumber: true })}
              />
              {errors.target_amount && (
                <p className="text-sm text-destructive">{errors.target_amount.message}</p>
              )}
            </div>

            {/* Current Amount */}
            <div className="space-y-2">
              <label htmlFor="current_amount" className="text-sm font-medium">
                当前金额
              </label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('current_amount', { valueAsNumber: true })}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                目标日期
              </label>
              <Input
                id="deadline"
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                {...register('deadline')}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                目标类别
              </label>
              <select
                id="category"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                {...register('category')}
              >
                <option value="">选择类别...</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium">优先级</label>
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setValue('priority', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
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
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
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

export default AddGoalDialog;
