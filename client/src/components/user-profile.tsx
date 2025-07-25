import { User, LogOut, Settings } from 'lucide-react';
import { useUserAuth } from '../hooks/use-user-auth';
import { userLogout } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

export function UserProfile() {
  const { userProfile } = useUserAuth();

  const handleLogout = async () => {
    try {
      await userLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userProfile) {
    return null;
  }

  const initials = `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          ข้อมูลส่วนตัว
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {userProfile.firstName} {userProfile.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              ชั้น {userProfile.grade} เลขที่ {userProfile.studentNumber}
            </p>
            <p className="text-sm text-gray-600">
              {userProfile.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</p>
            <p className="text-sm">{userProfile.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">สถานะ</p>
            <p className="text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                นักเรียน
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
