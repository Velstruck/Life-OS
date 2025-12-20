import { useGroups, useCreateGroup, useJoinGroup } from '../hooks/useGroups';
import { useState } from 'react';
import { Plus, Wallet, Users, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Meteors } from '@/components/ui/meteors';

export default function KhataPage() {
  const navigate = useNavigate();
  const { data: groups, isLoading } = useGroups();
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const group = await createGroupMutation.mutateAsync({ name: name.trim() });
      setName('');
      setShowForm(false);
      toast.success('Group created!');
      navigate(`/khata/${group.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      const group = await joinGroupMutation.mutateAsync({ inviteCode: inviteCode.trim().toUpperCase() });
      setInviteCode('');
      setShowJoinForm(false);
      toast.success('Joined group successfully!');
      navigate(`/khata/${group.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to join group. Check the invite code.');
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-28 space-y-4">
        <div className="skeleton h-10 w-48"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Floating Pill Header */}
      <div className="sticky top-0 z-10 pt-4 pb-6 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-full shadow-md px-6 py-4 flex items-center justify-between border border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Khata</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Smart expense splitter</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="bg-success-600 dark:bg-success-500 text-white p-2.5 rounded-full hover:bg-success-700 dark:hover:bg-success-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md touch-target"
              title="Join with code"
            >
              <UserPlus size={22} />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary-600 dark:bg-primary-500 text-white p-2.5 rounded-full hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md touch-target"
              title="Create new"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {showJoinForm && (
          <div className="card animate-slide-up border-success-100 dark:border-success-900/50 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={20} className="text-success-600 dark:text-success-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Join a Group</h2>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  className="input-field font-mono text-lg text-center tracking-wider"
                  required
                  autoFocus
                  maxLength={6}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ask your friend to share their group's invite code
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={joinGroupMutation.isPending || inviteCode.trim().length !== 6}
                  className="bg-success-600 dark:bg-success-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-success-700 dark:hover:bg-success-600 active:scale-95 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setInviteCode('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showForm && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={20} className="text-primary-600 dark:text-primary-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Create New Group</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekend Trip, Roommates"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending || !name.trim()}
                  className="btn-primary flex-1"
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setName('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!groups || groups.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No groups yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Create a group to start tracking expenses</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/khata/${group.id}`)}
                className="w-full text-left card hover:shadow-lg transition-all duration-200 active:scale-[0.99] group relative overflow-hidden"
              >
                <Meteors number={6} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {Array.isArray(group.members) ? group.members.length : 0} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet size={16} />
                        {Array.isArray(group.expenses) ? group.expenses.length : 0} expenses
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
