/**
 * RemindersCard - Goal Reminders Management
 * Shows and manages reminders for goals
 */

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Bell, BellOff, Plus, Trash2, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Reminder, UpcomingReminder } from '@/types/database';

interface RemindersCardProps {
  reminders: Reminder[] | UpcomingReminder[];
  isLoading?: boolean;
  onAdd?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  isUpdating?: boolean;
}

function isUpcomingReminder(r: Reminder | UpcomingReminder): r is UpcomingReminder {
  return 'reminder_id' in r;
}

export function RemindersCard({
  reminders,
  isLoading,
  onAdd,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isUpdating,
}: RemindersCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            提醒
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = reminders.filter((r) => {
    if (isUpcomingReminder(r)) return true;
    return !r.is_read;
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            提醒
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onMarkAllAsRead && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={isUpdating}
                title="全部标为已读"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="mt-3">暂无提醒</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const id = isUpcomingReminder(reminder) ? reminder.reminder_id : reminder.id;
              const isRead = isUpcomingReminder(reminder) ? false : reminder.is_read;
              const remindAt = isUpcomingReminder(reminder)
                ? reminder.remind_at
                : reminder.remind_at;

              return (
                <div
                  key={id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isRead ? 'bg-muted/30' : 'bg-background'
                  }`}
                >
                  <div className={`mt-0.5 ${isRead ? 'text-muted-foreground' : 'text-primary'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isRead ? 'text-muted-foreground' : ''}`}>
                      {reminder.title}
                    </div>
                    {reminder.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {reminder.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(remindAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onMarkAsRead && !isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(id)}
                        disabled={isUpdating}
                        title="标为已读"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(id)}
                        disabled={isUpdating}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RemindersCard;
