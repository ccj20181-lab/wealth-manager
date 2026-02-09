/**
 * AddReminderDialog - Create Reminder Dialog
 * Form for adding reminders linked to goals
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { Loader2, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReminderType } from '@/types/database';

const reminderSchema = z.object({
  title: z.string().min(1, 'Please enter a title'),
  description: z.string().optional(),
  remind_at: z.string().min(1, 'Please select a date and time'),
  type: z.enum(['goal', 'budget', 'investment', 'insurance', 'other'] as const).optional(),
  reference_id: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface AddReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderFormData) => Promise<void>;
  isSubmitting?: boolean;
  defaultReferenceId?: string;
  defaultType?: ReminderType;
}

const typeOptions: { value: ReminderType; label: string }[] = [
  { value: 'goal', label: '目标提醒' },
  { value: 'budget', label: '预算提醒' },
  { value: 'investment', label: '投资提醒' },
  { value: 'insurance', label: '保险提醒' },
  { value: 'other', label: '其他' },
];

export function AddReminderDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultReferenceId,
  defaultType = 'goal',
}: AddReminderDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      type: defaultType,
      reference_id: defaultReferenceId,
      remind_at: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const handleFormSubmit = async (data: ReminderFormData) => {
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
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              添加提醒
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                提醒标题 *
              </label>
              <Input
                id="title"
                placeholder="例如: 检查投资进度"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                备注说明
              </label>
              <Input
                id="description"
                placeholder="可选备注..."
                {...register('description')}
              />
            </div>

            {/* Remind At */}
            <div className="space-y-2">
              <label htmlFor="remind_at" className="text-sm font-medium">
                提醒时间 *
              </label>
              <Input
                id="remind_at"
                type="datetime-local"
                {...register('remind_at')}
              />
              {errors.remind_at && (
                <p className="text-sm text-destructive">{errors.remind_at.message}</p>
              )}
            </div>

            {/* Quick Time Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '明天', days: 1 },
                { label: '3天后', days: 3 },
                { label: '一周后', days: 7 },
                { label: '一个月后', days: 30 },
              ].map((option) => (
                <Button
                  key={option.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = addDays(new Date(), option.days);
                    date.setHours(9, 0, 0, 0);
                    setValue('remind_at', format(date, "yyyy-MM-dd'T'HH:mm"));
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                提醒类型
              </label>
              <select
                id="type"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                {...register('type')}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                  '添加提醒'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddReminderDialog;
