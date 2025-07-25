import { User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useUserAuth } from '../hooks/use-user-auth';
import { userLogout, updateUserProfile } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

// Schema for user profile editing (excluding role and email)
const editProfileSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  grade: z.string().min(1, "กรุณากรอกชั้น"),
  studentNumber: z.string().min(1, "กรุณากรอกเลขที่"),
  phone: z.string().regex(/^[0-9]{10}$/, "กรุณากรอกเบอร์โทร 10 หลัก")
});

type EditProfileData = z.infer<typeof editProfileSchema>;

export function UserProfile() {
  const { userProfile } = useUserAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
  });

  const handleLogout = async () => {
    try {
      await userLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setValue('firstName', userProfile.firstName);
      setValue('lastName', userProfile.lastName);
      setValue('grade', userProfile.grade);
      setValue('studentNumber', userProfile.studentNumber);
      setValue('phone', userProfile.phone);
      setEditDialogOpen(true);
    }
  };

  const onSubmitEdit = async (data: EditProfileData) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      const updateData = {
        ...data,
        email: userProfile.email, // Keep existing email
        role: userProfile.role     // Keep existing role
      };
      
      await updateUserProfile(userProfile.uid, updateData);
      
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว",
      });
      
      setEditDialogOpen(false);
      reset();
      
      // Trigger a page refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            onClick={handleEditProfile}
          >
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

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
            <DialogDescription>
              อัปเดตข้อมูลส่วนตัวของคุณ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">ชั้น</Label>
                <Input
                  id="grade"
                  {...register("grade")}
                  className={errors.grade ? "border-red-500" : ""}
                />
                {errors.grade && (
                  <p className="text-red-500 text-sm">{errors.grade.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNumber">เลขที่</Label>
                <Input
                  id="studentNumber"
                  {...register("studentNumber")}
                  className={errors.studentNumber ? "border-red-500" : ""}
                />
                {errors.studentNumber && (
                  <p className="text-red-500 text-sm">{errors.studentNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
