import { ReactNode } from 'react';
import { useUserAuth } from '../hooks/use-user-auth';
import { useRoleAccess } from '../hooks/use-role-access';
import { StatusCardSkeleton } from './loading-skeletons';
import LoginPage from '../pages/login';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LogOut, AlertCircle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useUserAuth();
  const { hasAdminAccess, userProfile } = useRoleAccess();

  console.log('AdminProtectedRoute state:', { 
    isAuthenticated, 
    loading, 
    hasAdminAccess, 
    userRole: userProfile?.role,
    user: user?.email 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <StatusCardSkeleton />
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  // First check: Must be authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, showing login page');
    return <LoginPage />;
  }

  // Second check: Must have admin access (admin or owner role)
  if (!hasAdminAccess) {
    console.log('User authenticated but no admin access, role:', userProfile?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8" />
                ไม่ได้รับอนุญาต
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  คุณไม่มีสิทธิ์เข้าถึงหน้า Admin Dashboard
                </p>
                <p className="text-sm text-gray-500">
                  หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
                </p>
                {userProfile && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">
                      ผู้ใช้: {userProfile.firstName} {userProfile.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      บทบาท: {userProfile.role === 'user' ? 'นักเรียน' : userProfile.role}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  กลับหน้าหลัก
                </Button>
                <Button 
                  onClick={() => {
                    // Force logout and redirect
                    import('../lib/firebase').then(({ userLogout }) => {
                      userLogout().then(() => {
                        window.location.href = '/login';
                      });
                    });
                  }}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('User has admin access, showing admin content');
  return <>{children}</>;
}
