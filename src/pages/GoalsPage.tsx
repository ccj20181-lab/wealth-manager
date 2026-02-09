/**
 * GoalsPage - Investment Goals Management
 * Main page for managing financial goals and reminders
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import {
  GoalsList,
  AddGoalDialog,
  UpdateProgressDialog,
  RemindersCard,
  AddReminderDialog,
} from '@/components/goals';
import {
  useGoalProgress,
  useCreateGoal,
  useUpdateGoal,
  useUpdateGoalProgress,
  useCompleteGoal,
  useDeleteGoal,
  useGoal,
  useUpcomingReminders,
  useCreateReminder,
  useMarkReminderAsRead,
  useMarkAllRemindersAsRead,
  useDeleteReminder,
} from '@/hooks/useGoals';
import type { FinancialGoalInsert, FinancialGoalUpdate, ReminderInsert, GoalProgress } from '@/types/database';

export function GoalsPage() {
  const [activeTab, setActiveTab] = useState('goals');
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [updateProgressGoal, setUpdateProgressGoal] = useState<GoalProgress | null>(null);

  // Data fetching
  const { data: goalProgress, isLoading: isLoadingGoals } = useGoalProgress();
  const { data: editGoalData } = useGoal(editGoalId || '');
  const { data: upcomingReminders, isLoading: isLoadingReminders } = useUpcomingReminders(30);

  // Goal mutations
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const updateGoalProgressMutation = useUpdateGoalProgress();
  const completeGoal = useCompleteGoal();
  const deleteGoal = useDeleteGoal();

  // Reminder mutations
  const createReminder = useCreateReminder();
  const markAsRead = useMarkReminderAsRead();
  const markAllAsRead = useMarkAllRemindersAsRead();
  const deleteReminder = useDeleteReminder();

  const handleAddGoal = async (data: FinancialGoalInsert) => {
    await createGoal.mutateAsync(data);
  };

  const handleEditGoal = async (data: FinancialGoalInsert) => {
    if (!editGoalId) return;
    await updateGoal.mutateAsync({
      id: editGoalId,
      updates: data as FinancialGoalUpdate,
    });
    setEditGoalId(null);
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('确定要删除这个目标吗？')) {
      deleteGoal.mutate(id);
    }
  };

  const handleCompleteGoal = (id: string) => {
    if (window.confirm('确定要将此目标标记为已完成吗？')) {
      completeGoal.mutate(id);
    }
  };

  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    await updateGoalProgressMutation.mutateAsync({ id, currentAmount });
  };

  const handleAddReminder = async (data: ReminderInsert) => {
    await createReminder.mutateAsync(data);
  };

  const handleMarkReminderAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllRemindersAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteReminder = (id: string) => {
    if (window.confirm('确定要删除这个提醒吗？')) {
      deleteReminder.mutate(id);
    }
  };

  const isUpdating =
    createGoal.isPending ||
    updateGoal.isPending ||
    updateGoalProgressMutation.isPending ||
    completeGoal.isPending ||
    deleteGoal.isPending;

  const isReminderUpdating =
    createReminder.isPending ||
    markAsRead.isPending ||
    markAllAsRead.isPending ||
    deleteReminder.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">投资目标</h1>
        <p className="text-muted-foreground">设定目标，追踪进度，实现财务自由</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex gap-2 border-b pb-2">
          <TabsTrigger
            value="goals"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'goals'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            我的目标
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reminders'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            提醒管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <GoalsList
            goals={goalProgress || []}
            isLoading={isLoadingGoals}
            onAdd={() => setIsAddGoalOpen(true)}
            onEdit={(id) => setEditGoalId(id)}
            onDelete={handleDeleteGoal}
            onComplete={handleCompleteGoal}
            onUpdateProgress={(id) => {
              const goal = goalProgress?.find((g) => g.goal_id === id);
              if (goal) setUpdateProgressGoal(goal);
            }}
            isUpdating={isUpdating}
          />
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <RemindersCard
            reminders={upcomingReminders || []}
            isLoading={isLoadingReminders}
            onAdd={() => setIsAddReminderOpen(true)}
            onMarkAsRead={handleMarkReminderAsRead}
            onMarkAllAsRead={handleMarkAllRemindersAsRead}
            onDelete={handleDeleteReminder}
            isUpdating={isReminderUpdating}
          />
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <AddGoalDialog
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onSubmit={handleAddGoal}
        isSubmitting={createGoal.isPending}
      />

      {/* Edit Goal Dialog */}
      <AddGoalDialog
        isOpen={!!editGoalId}
        onClose={() => setEditGoalId(null)}
        onSubmit={handleEditGoal}
        isSubmitting={updateGoal.isPending}
        editGoal={editGoalData}
      />

      {/* Update Progress Dialog */}
      <UpdateProgressDialog
        isOpen={!!updateProgressGoal}
        onClose={() => setUpdateProgressGoal(null)}
        onSubmit={handleUpdateProgress}
        isSubmitting={updateGoalProgressMutation.isPending}
        goal={updateProgressGoal}
      />

      {/* Add Reminder Dialog */}
      <AddReminderDialog
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        onSubmit={handleAddReminder}
        isSubmitting={createReminder.isPending}
      />
    </div>
  );
}

export default GoalsPage;
