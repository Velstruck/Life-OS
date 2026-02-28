import { Outlet } from 'react-router-dom';
import { Home, Zap, Wallet, User, Camera } from 'lucide-react';
import { FloatingDock } from '@/components/ui/floating-dock';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function MobileLayout() {
  const navItems = [
    { 
      title: 'Home', 
      icon: <Home size={20} strokeWidth={2} />,
      href: '/home'
    },
    { 
      title: 'Streaks', 
      icon: <Zap size={20} strokeWidth={2} />,
      href: '/streaks'
    },
    { 
      title: 'Khata', 
      icon: <Wallet size={20} strokeWidth={2} />,
      href: '/khata'
    },
    { 
      title: 'Memories', 
      icon: <Camera size={20} strokeWidth={2} />,
      href: '/memories'
    },
    { 
      title: 'Profile', 
      icon: <User size={20} strokeWidth={2} />,
      href: '/profile'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background Beams */}
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      <main className="flex-1 w-full pb-24 flex justify-center relative z-10">
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-50 px-4">
        <FloatingDock items={navItems} />
        <ThemeToggle />
      </div>
    </div>
  );
}
