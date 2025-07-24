import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Umbrella, Check, User, TrendingUp, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminLoginSchema, type AdminLogin } from '@shared/schema';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function AdminDashboard() {
  const { user, isAuthenticated, login, logout } = useAdminAuth();
  const { umbrellas, activities, availableCount, borrowedCount } = useUmbrellaData();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onLogin = async (data: AdminLogin) => {
    setIsLoggingIn(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบจัดการ",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "ออกจากระบบแล้ว",
        description: "ขอบคุณที่ใช้บริการ",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้",
        variant: "destructive"
      });
    }
  };

  const forceReturn = async (umbrellaId: number) => {
    try {
      const umbrella = umbrellas[umbrellaId];
      await updateUmbrella(umbrellaId, {
        ...umbrella,
        status: 'available',
        borrower: null
      });

      await addActivity({
        type: 'return',
        umbrellaId,
        location: umbrella.currentLocation,
        timestamp: Date.now(),
        note: 'Force returned by admin'
      });

      toast({
        title: "บังคับคืนร่มสำเร็จ",
        description: `ร่ม #${umbrellaId} ถูกบังคับคืนแล้ว`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบังคับคืนร่มได้",
        variant: "destructive"
      });
    }
  };

  const todayBorrows = activities.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity.timestamp);
    return activity.type === 'borrow' && 
           activityDate.toDateString() === today.toDateString();
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                Admin Login
              </CardTitle>
              <p className="text-center text-sm text-gray-600">
                เข้าสู่ระบบเพื่อจัดการร่ม
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@school.com"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสผ่าน</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-1" />
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Umbrella className="text-blue-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ร่มทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">21</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Check className="text-green-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ร่มว่าง</p>
                  <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <User className="text-orange-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ร่มที่ยืม</p>
                  <p className="text-2xl font-bold text-gray-900">{borrowedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="text-blue-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">ยืมวันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">{todayBorrows}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Umbrella Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>จัดการร่ม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมายเลข
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ตำแหน่ง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ยืม
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(umbrellas).map((umbrella) => (
                    <tr key={umbrella.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{umbrella.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={umbrella.status === 'available' ? 'default' : 'secondary'}
                          className={umbrella.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'}
                        >
                          {umbrella.status === 'available' ? 'ว่าง' : 'ยืม'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {umbrella.currentLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {umbrella.borrower?.nickname || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {umbrella.status === 'borrowed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => forceReturn(umbrella.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Force Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
