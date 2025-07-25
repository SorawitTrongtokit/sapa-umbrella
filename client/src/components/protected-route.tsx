import { ReactNode } from 'react';
import { useUserAuth } from '../hooks/use-user-auth';
import { StatusCardSkeleton } from './loading-skeletons';
import LoginPage from '../pages/login';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useUserAuth();

  console.log('ProtectedRoute state:', { isAuthenticated, loading, user: user?.email });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <StatusCardSkeleton />
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, showing login page');
    return <LoginPage />;
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
}
