import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
