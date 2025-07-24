import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Umbrella, Check, User, TrendingUp, RotateCcw, Edit, History, MapPin, Calendar, X, BarChart3, RefreshCw, AlertCircle, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { adminLoginSchema, type AdminLogin, LOCATIONS } from '@shared/schema';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { updateUmbrella, addActivity } from '@/lib/firebase';

export default function AdminDashboard() {
  const { user, isAuthenticated, login, logout } = useAdminAuth();
  const { umbrellas, activities, availableCount, borrowedCount } = useUmbrellaData();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [editingUmbrella, setEditingUmbrella] = useState<any>(null);
  const [viewingLogs, setViewingLogs] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const editForm = useForm({
    defaultValues: {
      status: '',
      currentLocation: '',
      borrowerNickname: '',
      borrowerPhone: ''
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

  const handleEditUmbrella = (umbrella: any) => {
    setEditingUmbrella(umbrella);
    editForm.reset({
      status: umbrella.status,
      currentLocation: umbrella.currentLocation,
      borrowerNickname: umbrella.borrower?.nickname || '',
      borrowerPhone: umbrella.borrower?.phone || ''
    });
  };

  const handleUpdateUmbrella = async (data: any) => {
    if (!editingUmbrella) return;
    
    setIsUpdating(true);
    try {
      const updatedData: any = {
        id: editingUmbrella.id,
        status: data.status,
        currentLocation: data.currentLocation,
        history: editingUmbrella.history || []
      };

      if (data.status === 'borrowed' && (data.borrowerNickname || data.borrowerPhone)) {
        updatedData.borrower = {
          nickname: data.borrowerNickname,
          phone: data.borrowerPhone,
          timestamp: editingUmbrella.borrower?.timestamp || Date.now()
        };
      } else {
        updatedData.borrower = null;
      }

      await updateUmbrella(editingUmbrella.id, updatedData);

      // Log admin update
      await addActivity({
        type: 'admin_update',
        umbrellaId: editingUmbrella.id,
        location: data.currentLocation,
        timestamp: Date.now(),
        note: `Admin updated umbrella data`
      });

      toast({
        title: "อัปเดตข้อมูลสำเร็จ",
        description: `ร่ม #${editingUmbrella.id} ถูกอัปเดตแล้ว`,
        variant: "default"
      });

      setEditingUmbrella(null);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getUmbrellaLogs = (umbrellaId: number) => {
    return activities
      .filter(activity => activity.umbrellaId === umbrellaId)
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const filteredUmbrellas = Object.values(umbrellas).filter(umbrella => 
    umbrella.id.toString().includes(searchTerm) ||
    umbrella.currentLocation.includes(searchTerm) ||
    (umbrella.borrower?.nickname || '').includes(searchTerm)
  );

  const todayReturns = activities.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity.timestamp);
    return activity.type === 'return' && 
           activityDate.toDateString() === today.toDateString();
  }).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    setShowStats(true);
  }, []);

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
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาหมายเลขร่ม, ตำแหน่ง, หรือชื่อผู้ยืม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="h-12 px-6"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            className="h-12 px-6"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            สถิติ
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className={`grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 transition-all duration-500 ${showStats ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
          <Card className="hover:shadow-md transition-shadow duration-200">
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
          
          <Card className="hover:shadow-md transition-shadow duration-200">
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
          
          <Card className="hover:shadow-md transition-shadow duration-200">
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
          
          <Card className="hover:shadow-md transition-shadow duration-200">
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

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <RotateCcw className="text-purple-600 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">คืนวันนี้</p>
                  <p className="text-2xl font-bold text-gray-900">{todayReturns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Umbrella Management Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              จัดการร่ม
              <Badge variant="secondary" className="ml-2">
                แสดง {filteredUmbrellas.length} จาก 21 ร่ม
              </Badge>
            </CardTitle>
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
                  {filteredUmbrellas.map((umbrella, index) => (
                    <tr 
                      key={umbrella.id} 
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-800 font-bold text-xs">#{umbrella.id}</span>
                          </div>
                          ร่ม #{umbrella.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={umbrella.status === 'available' ? 'default' : 'secondary'}
                          className={`animate-pulse-slow ${umbrella.status === 'available' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'}`}
                        >
                          {umbrella.status === 'available' ? '✅ ว่าง' : '🔄 ยืม'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          {umbrella.currentLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {umbrella.borrower ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{umbrella.borrower.nickname}</div>
                            <div className="text-sm text-gray-500">{umbrella.borrower.phone}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditUmbrella(umbrella)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="แก้ไขข้อมูลร่ม"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setViewingLogs(umbrella.id)}
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="ดู Log การใช้งาน"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          {umbrella.status === 'borrowed' && (
                            <Button
                              onClick={() => forceReturn(umbrella.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              title="บังคับคืน"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Umbrella Dialog */}
        <Dialog open={!!editingUmbrella} onOpenChange={() => setEditingUmbrella(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                แก้ไขข้อมูลร่ม #{editingUmbrella?.id}
              </DialogTitle>
              <DialogDescription>
                แก้ไขสถานะและข้อมูลของร่ม
              </DialogDescription>
            </DialogHeader>
            
            {editingUmbrella && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateUmbrella)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สถานะ</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">ว่าง</SelectItem>
                            <SelectItem value="borrowed">ถูกยืม</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="currentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ตำแหน่งปัจจุบัน</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกตำแหน่ง" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(LOCATIONS).map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {editForm.watch('status') === 'borrowed' && (
                    <>
                      <FormField
                        control={editForm.control}
                        name="borrowerNickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อเล่นผู้ยืม</FormLabel>
                            <FormControl>
                              <Input placeholder="ชื่อเล่น" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name="borrowerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>เบอร์โทรผู้ยืม</FormLabel>
                            <FormControl>
                              <Input placeholder="เบอร์โทร" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingUmbrella(null)}
                      disabled={isUpdating}
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdating ? 'กำลังอัปเดต...' : 'อัปเดต'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* View Logs Dialog */}
        <Dialog open={viewingLogs !== null} onOpenChange={() => setViewingLogs(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-green-600" />
                Log การใช้งานร่ม #{viewingLogs}
              </DialogTitle>
              <DialogDescription>
                ประวัติการยืม-คืนและการเปลี่ยนแปลงข้อมูล
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-96">
              <div className="space-y-3">
                {viewingLogs && getUmbrellaLogs(viewingLogs).length > 0 ? (
                  getUmbrellaLogs(viewingLogs).map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        {log.type === 'borrow' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {log.type === 'return' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {log.type === 'admin_update' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {log.type === 'borrow' && '🌂 ยืมร่ม'}
                            {log.type === 'return' && '✅ คืนร่ม'}
                            {log.type === 'admin_update' && '⚙️ อัปเดตโดย Admin'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>ที่: {log.location}</span>
                          </div>
                          {log.nickname && (
                            <div>โดย: {log.nickname}</div>
                          )}
                          {log.note && (
                            <div className="text-xs text-gray-500 mt-1">
                              หมายเหตุ: {log.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>ไม่มี Log การใช้งาน</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button 
                onClick={() => setViewingLogs(null)}
                className="w-full"
              >
                ปิด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
