import { useParams, useNavigate } from 'react-router-dom';
import { useHabit, useAddHabitLog, useDeleteHabit } from '../hooks/useHabits';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeft, Users, Copy, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { User } from '../types';
import { MemberTooltip } from '@/components/ui/member-tooltip';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function StreakDetail() {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const { data: habit, isLoading } = useHabit(habitId!);
  const addLogMutation = useAddHabitLog();
  const deleteHabitMutation = useDeleteHabit();
  const currentUser = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopyCode = () => {
    if (habit?.inviteCode) {
      navigator.clipboard.writeText(habit.inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!habitId || !habit) return;

    try {
      await deleteHabitMutation.mutateAsync(habitId);
      toast.success('Habit deleted successfully');
      setShowDeleteModal(false);
      navigate('/streaks');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete habit');
    }
  };

  const handleToggleDate = (date: string) => {
    if (!habitId) return;
    addLogMutation.mutate({ habitId, date });
  };

  const getLast12Weeks = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      
      const days = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + j);
        days.push(date.toISOString().split('T')[0]);
      }
      weeks.push(days);
    }
    
    return weeks;
  };

  const weeks = useMemo(() => getLast12Weeks(), []);

  const getCellOpacity = (date: string) => {
    const log = habit?.logs?.find((l) => l.date === date);
    if (!log || log.completedBy.length === 0) return 0;
    
    const totalParticipants = habit?.participants?.length || 1;
    const completedCount = log.completedBy.length;
    return completedCount / totalParticipants;
  };

  const isCompletedByUser = (date: string) => {
    const log = habit?.logs?.find((l) => l.date === date);
    if (!log) return false;
    return log.completedBy.some((id) => id === currentUser?.id);
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-28">
        <div className="skeleton h-8 w-48 mb-6"></div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="px-4 pt-4 pb-28">
        <p className="text-slate-600 dark:text-slate-400">Habit not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 pt-4 pb-6 px-4">
        <div className="flex items-center gap-3">
          {/* Separate Back Button */}
          <button
            onClick={() => navigate('/streaks')}
            className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full shadow-md hover:shadow-lg transition-all duration-200 touch-target border border-slate-100 dark:border-slate-700"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          {/* Main Pill Header */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-full shadow-md px-6 py-4 flex items-center justify-between border border-slate-100 dark:border-slate-700">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{habit.title}</h1>
              {habit.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{habit.description}</p>
              )}
            </div>
            {/* Delete button - only show to creator */}
            {currentUser && habit.createdBy && 
             (typeof habit.createdBy === 'string' ? habit.createdBy === currentUser.id : habit.createdBy.id === currentUser.id) && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2.5 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-full transition-all duration-200 touch-target ml-4"
                title="Delete habit"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Participants & Invite Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary-600 dark:text-primary-400" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Participants</h2>
            <span className="text-sm text-slate-600 dark:text-slate-400">({habit.participants?.length || 0})</span>
          </div>

          <div>
            <MemberTooltip 
              members={(habit.participants || []).map((participant) => {
                const user = participant as User;
                return {
                  id: user.id,
                  name: user.name || 'Unknown',
                  email: user.email
                };
              })} 
              maxVisible={8}
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Invite Code</p>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-between w-full bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">
                {habit.inviteCode}
              </span>
              {copied ? (
                <Check size={20} className="text-success-600 dark:text-success-400" />
              ) : (
                <Copy size={20} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Last 12 Weeks</h2>
          
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="inline-flex flex-col gap-1 min-w-full">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div key={dayIndex} className="flex gap-1">
                  {weeks.map((week, weekIndex) => {
                    const date = week[dayIndex];
                    const opacity = getCellOpacity(date);
                    const isCompleted = isCompletedByUser(date);
                    const isFuture = new Date(date) > new Date();
                    
                    return (
                      <button
                        key={`${weekIndex}-${dayIndex}`}
                        onClick={() => !isFuture && handleToggleDate(date)}
                        disabled={isFuture}
                        className={`w-4 h-4 rounded transition-all touch-target relative group ${
                          isFuture
                            ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed'
                            : isCompleted
                            ? 'ring-2 ring-primary-400 dark:ring-primary-500 ring-offset-1 dark:ring-offset-slate-800 animate-pop'
                            : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 hover:ring-offset-1 dark:hover:ring-offset-slate-800'
                        }`}
                        style={{
                          backgroundColor: isFuture
                            ? undefined
                            : opacity === 0
                            ? 'rgb(148 163 184 / 0.3)'
                            : `rgba(34, 197, 94, ${Math.max(0.2, opacity)})`,
                        }}
                        title={date}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          {date}
                          <br />
                          {opacity > 0 ? `${Math.round(opacity * 100)}% complete` : 'No activity'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 text-xs text-slate-600 dark:text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }}></div>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 1)' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-success-200 dark:border-success-800/50 shadow-sm">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Checks</p>
              <p className="text-3xl font-bold text-success-700 dark:text-success-400">
                {habit.logs?.filter((log) => log.completedBy.includes(currentUser?.id || '')).length || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4 rounded-2xl border border-primary-200 dark:border-primary-800/50 shadow-sm">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Group Total</p>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                {habit.logs?.reduce((sum, log) => sum + log.completedBy.length, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${habit.title}"? This will remove it for all participants and cannot be undone.`}
        confirmText="Delete Habit"
        cancelText="Cancel"
        isLoading={deleteHabitMutation.isPending}
        isDangerous={true}
      />
    </div>
  );
}
