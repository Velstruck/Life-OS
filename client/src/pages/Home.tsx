import { useNavigate } from 'react-router-dom';
import { Zap, Wallet, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Meteors } from '@/components/ui/meteors';
import { NameFlip } from '@/components/ui/name-flip';

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen pb-28">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <p className="text-slate-600 dark:text-slate-400 mb-2">Welcome back,</p>
          <NameFlip name={user?.name || 'User'} />
        </div>

        {/* Main Features */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/streaks')}
            className="w-full card group hover:shadow-soft-lg active:scale-98 transition-all relative overflow-hidden"
          >
            <Meteors number={8} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Zap size={28} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                  Streaks
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Track daily habits with friends and build consistency together
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium">
                  <TrendingUp size={16} />
                  <span>View your progress →</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/khata')}
            className="w-full card group hover:shadow-soft-lg active:scale-98 transition-all relative overflow-hidden"
          >
            <Meteors number={8} />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Wallet size={28} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                  Khata
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Split expenses fairly and settle debts with minimal transactions
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium">
                  <Users size={16} />
                  <span>Manage groups →</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Stats or Tips */}
        <div className="card bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-950/50 dark:to-indigo-950/50 border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Life OS</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your personal management PWA. Track habits, split expenses, and stay organized—all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
