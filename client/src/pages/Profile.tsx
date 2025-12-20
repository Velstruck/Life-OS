import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { toast } from 'sonner';
import { LogOut, Mail, User, Shield } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Floating Pill Header */}
      <div className="sticky top-0 z-10 pt-4 pb-6 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-full shadow-md px-6 py-4 border border-slate-100 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account</p>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Profile Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 dark:from-primary-600 dark:to-indigo-700 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <User size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Full Name</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Email Address</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Account Status</p>
                <p className="font-medium text-success-700 dark:text-success-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">About Life OS</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Version 1.0.0
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your personal management PWA for tracking habits and splitting expenses.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full btn-danger flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
