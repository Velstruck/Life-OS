import { useParams, useNavigate } from 'react-router-dom';
import { useGroup, useSettlements, useAddExpense, useDeleteExpense, useDeleteGroup } from '../hooks/useGroups';
import { useAuthStore } from '../stores/authStore';
import { ArrowLeft, Plus, Users, Copy, Check, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { User, Expense } from '../types';
import { MemberTooltip } from '@/components/ui/member-tooltip';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading: groupLoading } = useGroup(groupId!);
  const { data: settlements, isLoading: settlementsLoading } = useSettlements(groupId!);
  const addExpenseMutation = useAddExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const deleteGroupMutation = useDeleteGroup();
  const currentUser = useAuthStore((state) => state.user);
  
  const [copied, setCopied] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopyCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !group) return;

    try {
      await deleteGroupMutation.mutateAsync(groupId);
      toast.success('Group deleted successfully');
      setShowDeleteModal(false);
      navigate('/khata');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !amount || !description.trim()) return;

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const members = Array.isArray(group?.members) ? group.members : [];
      const splitAmount = expenseAmount / members.length;
      
      const splits = members.map((member) => ({
        userId: typeof member === 'string' ? member : member.id,
        amount: splitAmount,
      }));

      await addExpenseMutation.mutateAsync({
        groupId,
        description: description.trim(),
        amount: expenseAmount,
        splits,
      });

      setDescription('');
      setAmount('');
      setShowExpenseForm(false);
      toast.success('Expense added!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!groupId) return;
    
    try {
      await deleteExpenseMutation.mutateAsync({ groupId, expenseId });
      toast.success('Expense deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  const getMyBalance = () => {
    if (!settlements || !currentUser) return 0;
    
    let balance = 0;
    settlements.forEach((settlement) => {
      if (settlement.from === currentUser.id) {
        balance -= settlement.amount;
      }
      if (settlement.to === currentUser.id) {
        balance += settlement.amount;
      }
    });
    
    return balance;
  };

  const myBalance = getMyBalance();

  if (groupLoading) {
    return (
      <div className="px-4 pt-4 pb-28 space-y-4">
        <div className="skeleton h-8 w-48"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="px-4 pt-4 pb-28">
        <p className="text-slate-600 dark:text-slate-400">Group not found</p>
      </div>
    );
  }

  const expenses = Array.isArray(group.expenses) ? group.expenses : [];
  const members = Array.isArray(group.members) ? group.members : [];

  return (
    <div className="min-h-screen pb-28">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 pt-4 pb-6 px-4">
        <div className="flex items-center gap-3">
          {/* Separate Back Button */}
          <button
            onClick={() => navigate('/khata')}
            className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full shadow-md hover:shadow-lg transition-all duration-200 touch-target border border-slate-100 dark:border-slate-700"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          {/* Main Pill Header */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-full shadow-md px-6 py-4 flex items-center justify-between border border-slate-100 dark:border-slate-700">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{group.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{members.length} members</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {/* Delete button - only show to creator */}
              {currentUser && group.createdBy && 
               (typeof group.createdBy === 'string' ? group.createdBy === currentUser.id : group.createdBy.id === currentUser.id) && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2.5 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-full transition-all duration-200 touch-target"
                  title="Delete group"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="bg-primary-600 dark:bg-primary-500 text-white p-2.5 rounded-full hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md touch-target"
                title="Add expense"
              >
                <Plus size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Your Net Status */}
        <div className={`card border-2 ${
          myBalance > 0
            ? 'bg-gradient-to-br from-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/20 border-success-200 dark:border-success-800/50 shadow-md'
            : myBalance < 0
            ? 'bg-gradient-to-br from-danger-50 to-red-50 dark:from-danger-900/20 dark:to-red-900/20 border-danger-200 dark:border-danger-800/50 shadow-md'
            : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Your Net Status</p>
              <p className={`text-4xl font-bold ${
                myBalance > 0
                  ? 'text-success-700 dark:text-success-400'
                  : myBalance < 0
                  ? 'text-danger-700 dark:text-danger-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                ₹{Math.abs(myBalance).toFixed(2)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'All settled up'}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              myBalance > 0
                ? 'bg-success-100 dark:bg-success-900/30'
                : myBalance < 0
                ? 'bg-danger-100 dark:bg-danger-900/30'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              {myBalance > 0 ? (
                <TrendingUp size={32} className="text-success-600 dark:text-success-400" />
              ) : myBalance < 0 ? (
                <TrendingDown size={32} className="text-danger-600 dark:text-danger-400" />
              ) : (
                <Check size={32} className="text-slate-600 dark:text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        {showExpenseForm && (
          <div className="card animate-slide-up border-primary-100 dark:border-primary-900/50 shadow-md">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-primary-600 dark:text-primary-400" />
              Add New Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner, Gas, Groceries"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                  required
                />
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Split equally among</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {members.length} members (₹{amount ? (parseFloat(amount) / members.length).toFixed(2) : '0.00'} each)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addExpenseMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settlements */}
        {!settlementsLoading && settlements && settlements.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Settlements</h2>
            <div className="space-y-3">
              {settlements.map((settlement, index) => {
                const fromUser = members.find((m) => (typeof m === 'string' ? m : m.id) === settlement.from) as User;
                const toUser = members.find((m) => (typeof m === 'string' ? m : m.id) === settlement.to) as User;
                const isMySettlement = settlement.from === currentUser?.id || settlement.to === currentUser?.id;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${
                      isMySettlement
                        ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 rounded-full flex items-center justify-center font-semibold">
                        {fromUser?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {settlement.from === currentUser?.id ? 'You' : fromUser?.name || 'Unknown'} →{' '}
                          {settlement.to === currentUser?.id ? 'You' : toUser?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {settlement.from === currentUser?.id ? 'Pay' : 'Receive'} ₹{settlement.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full flex items-center justify-center font-semibold">
                      {toUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Members & Invite */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary-600 dark:text-primary-400" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Members</h2>
            <span className="text-sm text-slate-600 dark:text-slate-400">({members.length})</span>
          </div>
          <div className="mb-4">
            <MemberTooltip 
              members={members.map((member) => {
                const user = member as User;
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
                {group.inviteCode}
              </span>
              {copied ? (
                <Check size={20} className="text-success-600 dark:text-success-400" />
              ) : (
                <Copy size={20} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expense Activity */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Activity</h2>
          {expenses.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const exp = expense as Expense;
                const paidByUser = typeof exp.paidBy === 'string'
                  ? members.find((m) => (typeof m === 'string' ? m : m.id) === exp.paidBy) as User
                  : exp.paidBy;
                const isPaidByMe = (typeof exp.paidBy === 'string' ? exp.paidBy : exp.paidBy.id) === currentUser?.id;

                return (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{exp.description}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Paid by {isPaidByMe ? 'You' : paidByUser?.name || 'Unknown'} • {new Date(exp.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100">₹{exp.amount.toFixed(2)}</p>
                      {isPaidByMe && (
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          disabled={deleteExpenseMutation.isPending}
                          className="p-2 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-xl transition-all duration-200 touch-target"
                          title="Delete expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group?"
        message={`Are you sure you want to delete "${group.name}"? This will remove it for all members and delete all expenses. This action cannot be undone.`}
        confirmText="Delete Group"
        cancelText="Cancel"
        isLoading={deleteGroupMutation.isPending}
        isDangerous={true}
      />
    </div>
  );
}
