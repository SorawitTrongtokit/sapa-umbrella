import { ReactNode } from 'react';
import { useUserAuth } from '../hooks/use-user-auth';
import { StatusCardSkeleton } from './loading-skeletons';
import LoginPage from '../pages/login';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <StatusCardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
