import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { authAPI } from './api/auth';
import MobileLayout from './layouts/MobileLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import StreaksPage from './pages/StreaksPage';
import StreakDetail from './pages/StreakDetail';
import KhataPage from './pages/KhataPage';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';
import MemoryLanePage from './pages/MemoryLanePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
  },
});

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const checkAuth = async () => {
      // Only check auth if there's a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await authAPI.getMe();
        setUser(response.user);
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 dark:border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } />

          {/* Protected routes */}
          <Route element={
            isAuthenticated ? <MobileLayout /> : <Navigate to="/login" replace />
          }>
            <Route path="/" element={<Home />} />
            <Route path="/streaks" element={<StreaksPage />} />
            <Route path="/streaks/:habitId" element={<StreakDetail />} />
            <Route path="/khata" element={<KhataPage />} />
            <Route path="/khata/:groupId" element={<GroupDetail />} />
            <Route path="/memories" element={<MemoryLanePage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </Router>
      <Toaster richColors position="bottom-center" />
    </QueryClientProvider>
  );
}

export default App;
