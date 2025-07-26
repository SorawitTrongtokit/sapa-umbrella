import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Settings, Shield, Crown, Eye, EyeOff, Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { getAllUsers, updateUserProfile, deleteUser, resetUserPassword, setTemporaryPassword, getTemporaryPassword, generateRandomPassword, getDecryptedPassword } from '../lib/firebase';
import { useRoleAccess } from '../hooks/use-role-access';
import { adminUserUpdateSchema, AdminUserUpdate, adminPasswordResetSchema, AdminPasswordReset, UserProfile } from '../../../shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';

export function OwnerDashboard() {
  const { hasOwnerAccess, userProfile } = useRoleAccess();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [tempPasswordDialogOpen, setTempPasswordDialogOpen] = useState(false);
  const [currentTempPassword, setCurrentTempPassword] = useState<string | null>(null);
  const [showRealPassword, setShowRealPassword] = useState(false);
  const [currentRealPassword, setCurrentRealPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue: setValueEdit
  } = useForm<AdminUserUpdate>({
    resolver: zodResolver(adminUserUpdateSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword
  } = useForm<AdminPasswordReset>({
    resolver: zodResolver(adminPasswordResetSchema),
  });

  useEffect(() => {
    if (hasOwnerAccess) {
      loadUsers();
    }
  }, [hasOwnerAccess]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setValueEdit('firstName', user.firstName);
    setValueEdit('lastName', user.lastName);
    setValueEdit('grade', user.grade);
    setValueEdit('studentNumber', user.studentNumber);
    setValueEdit('phone', user.phone);
    setValueEdit('email', user.email);
    setValueEdit('role', user.role);
    setEditDialogOpen(true);
  };

  const onSubmitEdit = async (data: AdminUserUpdate) => {
    if (!selectedUser) return;

    console.log('Updating user:', selectedUser.uid);
    console.log('Data to update:', data);

    try {
      await updateUserProfile(selectedUser.uid, data);
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว",
      });
      setEditDialogOpen(false);
      resetEdit();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      await resetUserPassword(selectedUser.email);
      toast({
        title: "สำเร็จ",
        description: `ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${selectedUser.email} แล้ว`,
      });
      setPasswordDialogOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตรหัสผ่านได้",
        variant: "destructive",
      });
    }
  };

  const handleSetTempPassword = async () => {
    if (!selectedUser) return;

    try {
      const tempPassword = generateRandomPassword();
      await setTemporaryPassword(selectedUser.uid, tempPassword);
      setCurrentTempPassword(tempPassword);
      
      toast({
        title: "สำเร็จ",
        description: "สร้าง Temporary Password แล้ว",
      });
      
      setTempPasswordDialogOpen(true);
    } catch (error) {
      console.error('Error setting temporary password:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง Temporary Password ได้",
        variant: "destructive",
      });
    }
  };

  const handleGetTempPassword = async (user: any) => {
    try {
      const tempPass = await getTemporaryPassword(user.uid);
      setSelectedUser(user);
      setCurrentTempPassword(tempPass);
      setTempPasswordDialogOpen(true);
    } catch (error) {
      console.error('Error getting temporary password:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดู Temporary Password ได้",
        variant: "destructive",
      });
    }
  };

  const handleGetRealPassword = async (user: any) => {
    try {
      const realPass = await getDecryptedPassword(user.uid);
      setSelectedUser(user);
      setCurrentRealPassword(realPass);
      setShowRealPassword(true);
    } catch (error) {
      console.error('Error getting real password:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดู Password ได้",
        variant: "destructive",
      });
    }
  };

  const handleResetUserPassword = async (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      // สร้างรหัสผ่านใหม่ด้วย encryption
      const { encryptPassword } = await import('../lib/encryption');
      const { updateUserProfile } = await import('../lib/firebase');
      
      const encryptedPassword = encryptPassword(newPassword);
      
      // อัพเดทรหัสผ่านในฐานข้อมูล
      await updateUserProfile(selectedUser.uid, {
        ...selectedUser,
        encryptedPassword: encryptedPassword,
        lastPasswordReset: new Date().toISOString(),
        tempPassword: newPassword // เก็บไว้สำหรับการอ้างอิง
      });

      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: `รหัสผ่านใหม่สำหรับ ${selectedUser.email}: ${newPassword}`,
      });

      setResetPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
      
      // รีเฟรชรายการผู้ใช้
      loadUsers();
      
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตรหัสผ่านได้",
        variant: "destructive",
      });
    }
  };

  const generateNewPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  const handleShowDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.uid === userProfile?.uid) {
      toast({
        title: "ไม่สามารถลบได้",
        description: "คุณไม่สามารถลบบัญชีของตัวเองได้",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteUser(user.uid);
      toast({
        title: "สำเร็จ",
        description: "ลบผู้ใช้เรียบร้อยแล้ว",
      });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้ใช้ได้",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default" className="bg-purple-600"><Crown className="w-3 h-3 mr-1" />Owner</Badge>;
      case 'admin':
        return <Badge variant="default" className="bg-blue-600"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="secondary"><UserCheck className="w-3 h-3 mr-1" />User</Badge>;
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.grade.toLowerCase().includes(searchLower) ||
      user.studentNumber.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort by grade first, then by student number
    const gradeA = a.grade.toLowerCase();
    const gradeB = b.grade.toLowerCase();
    
    if (gradeA !== gradeB) {
      return gradeA.localeCompare(gradeB);
    }
    
    // If grades are the same, sort by student number (as numbers)
    const studentNumA = parseInt(a.studentNumber) || 0;
    const studentNumB = parseInt(b.studentNumber) || 0;
    
    return studentNumA - studentNumB;
  });

  if (!hasOwnerAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Owner เท่านั้น)
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            Owner Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">จัดการข้อมูลและสิทธิ์ของผู้ใช้ทั้งหมด</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              ผู้ใช้ทั้งหมด ({filteredUsers.length}/{users.length} คน)
            </CardTitle>
            
            {/* Search Bar */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="ค้นหาจากชื่อ, อีเมล, ชั้น, เลขที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา' : 'ไม่มีผู้ใช้ในระบบ'}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.uid} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-white">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">{user.firstName} {user.lastName}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p className="break-all">📧 {user.email}</p>
                        <p>🎓 ชั้น {user.grade} เลขที่ {user.studentNumber}</p>
                        <p>📱 {user.phone}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs">สร้าง: {new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => handleGetTempPassword(user)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Temp Pass
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2 bg-red-50 hover:bg-red-100 border-red-300"
                            onClick={() => handleGetRealPassword(user)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Real Pass
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2 bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
                            onClick={() => handleResetUserPassword(user)}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                        {user.updatedAt && user.updatedAt !== user.createdAt && (
                          <p className="text-xs text-blue-600">
                            อัปเดต: {new Date(user.updatedAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="text-xs"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        แก้ไข
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowDetails(user)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        ดูรายละเอียด
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          handleResetPassword();
                        }}
                        className="text-xs"
                      >
                        รีเซ็ตรหัสผ่าน
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs"
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            ลบ
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบผู้ใช้</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ที่จะลบบัญชี "{user.firstName} {user.lastName}"? 
                              การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              ลบบัญชี
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
              <DialogDescription>
                แก้ไขข้อมูลและสิทธิ์ของ {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input {...registerEdit('firstName')} />
                  {errorsEdit.firstName && (
                    <p className="text-sm text-red-600">{errorsEdit.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input {...registerEdit('lastName')} />
                  {errorsEdit.lastName && (
                    <p className="text-sm text-red-600">{errorsEdit.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">ชั้น</Label>
                  <Input {...registerEdit('grade')} />
                  {errorsEdit.grade && (
                    <p className="text-sm text-red-600">{errorsEdit.grade.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="studentNumber">เลขที่</Label>
                  <Input {...registerEdit('studentNumber')} />
                  {errorsEdit.studentNumber && (
                    <p className="text-sm text-red-600">{errorsEdit.studentNumber.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input {...registerEdit('phone')} />
                {errorsEdit.phone && (
                  <p className="text-sm text-red-600">{errorsEdit.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input {...registerEdit('email')} type="email" />
                {errorsEdit.email && (
                  <p className="text-sm text-red-600">{errorsEdit.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">สิทธิ์</Label>
                <Select onValueChange={(value) => setValueEdit('role', value as 'user' | 'admin' | 'owner')}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสิทธิ์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User - ผู้ใช้ทั่วไป</SelectItem>
                    <SelectItem value="admin">Admin - ผู้ดูแลระบบ</SelectItem>
                    <SelectItem value="owner">Owner - เจ้าของระบบ</SelectItem>
                  </SelectContent>
                </Select>
                {errorsEdit.role && (
                  <p className="text-sm text-red-600">{errorsEdit.role.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
              <DialogDescription>
                ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของ {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                อีเมลที่จะส่งลิงก์: <strong>{selectedUser?.email}</strong>
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleResetPassword}>
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPasswordDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                รายละเอียดผู้ใช้: {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</Label>
                    <p className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">สิทธิ์</Label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">ข้อมูลติดต่อ</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">อีเมล</Label>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</Label>
                      <p>{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">ข้อมูลการศึกษา</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ชั้น</Label>
                      <p>{selectedUser.grade}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">เลขที่</Label>
                      <p>{selectedUser.studentNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">ข้อมูลความปลอดภัย</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">รหัสผ่าน</Label>
                        <p className="text-sm text-gray-500">ไม่สามารถแสดงได้เพื่อความปลอดภัย</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowUserDetails(false);
                          setPasswordDialogOpen(true);
                        }}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        รีเซ็ตรหัสผ่าน
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">สร้างบัญชีเมื่อ</Label>
                        <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleString('th-TH')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">อัปเดตล่าสุด</Label>
                        <p className="text-sm">{new Date(selectedUser.updatedAt).toLocaleString('th-TH')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">ข้อมูลระบบ</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>UID:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{selectedUser.uid}</code></p>
                    <div className="flex gap-2">
                      <span>สถานะบัญชี:</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserDetails(false);
                      handleEditUser(selectedUser);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    แก้ไขข้อมูล
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserDetails(false)}
                  >
                    ปิด
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Temporary Password Dialog */}
        <Dialog open={tempPasswordDialogOpen} onOpenChange={setTempPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Temporary Password
              </DialogTitle>
              <DialogDescription>
                รหัสผ่านชั่วคราวสำหรับผู้ใช้ {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">ผู้ใช้: {selectedUser?.firstName} {selectedUser?.lastName}</h4>
                
                {currentTempPassword ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <Label className="text-sm font-medium">Temporary Password:</Label>
                        <p className="text-lg font-mono font-bold text-blue-600">{currentTempPassword}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(currentTempPassword);
                          toast({
                            title: "คัดลอกแล้ว",
                            description: "คัดลอก password ไปยัง clipboard แล้ว",
                          });
                        }}
                      >
                        คัดลอก
                      </Button>
                    </div>
                    
                    <div className="text-sm text-yellow-700">
                      <p>⚠️ <strong>คำเตือน:</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Password นี้ใช้ได้เพียง 24 ชั่วโมง</li>
                        <li>ผู้ใช้จะต้องเปลี่ยนรหัสผ่านในการ login ครั้งแรก</li>
                        <li>กรุณาส่งให้ผู้ใช้โดยตรงและปลอดภัย</li>
                        <li>ห้ามแชร์ password นี้ในที่สาธารณะ</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-yellow-700 mb-3">ไม่มี Temporary Password หรือหมดอายุแล้ว</p>
                    <Button
                      onClick={() => {
                        setTempPasswordDialogOpen(false);
                        handleSetTempPassword();
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      สร้าง Temporary Password ใหม่
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTempPasswordDialogOpen(false);
                    setCurrentTempPassword(null);
                  }}
                  className="flex-1"
                >
                  ปิด
                </Button>
                {currentTempPassword && (
                  <Button
                    onClick={() => {
                      setTempPasswordDialogOpen(false);
                      handleSetTempPassword();
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    สร้างใหม่
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Real Password Dialog */}
        <Dialog open={showRealPassword} onOpenChange={setShowRealPassword}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                Password จริง - ความลับสุดยอด
              </DialogTitle>
              <DialogDescription>
                รหัสผ่านจริงของผู้ใช้ {selectedUser?.firstName} {selectedUser?.lastName} (ข้อมูลความลับ)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">ผู้ใช้: {selectedUser?.firstName} {selectedUser?.lastName}</h4>
                
                {currentRealPassword ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                      <div>
                        <Label className="text-sm font-medium text-red-700">Password จริง:</Label>
                        <p className="text-lg font-mono font-bold text-red-600">{currentRealPassword}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 hover:bg-red-50"
                        onClick={() => {
                          navigator.clipboard.writeText(currentRealPassword!);
                          toast({
                            title: "คัดลอกแล้ว",
                            description: "คัดลอก password ไปยัง clipboard แล้ว",
                          });
                        }}
                      >
                        คัดลอก
                      </Button>
                    </div>
                    
                    <div className="text-sm text-red-700">
                      <p>🚨 <strong>คำเตือนสำคัญ:</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>นี่คือรหัสผ่านจริงของผู้ใช้</li>
                        <li>ห้ามแชร์หรือเปิดเผยในที่สาธารณะ</li>
                        <li>ใช้เฉพาะเมื่อจำเป็นในการช่วยเหลือผู้ใช้</li>
                        <li>แนะนำให้ผู้ใช้เปลี่ยนรหัสผ่านใหม่หลังการช่วยเหลือ</li>
                        <li>ระวังการ Screen Record หรือการถ่ายภาพหน้าจอ</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-700 mb-3">ไม่พบรหัสผ่าน หรือยังไม่ได้เข้ารหัสไว้</p>
                    <p className="text-sm text-gray-600">ผู้ใช้อาจสมัครสมาชิกก่อนระบบเข้ารหัส password</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRealPassword(false);
                    setCurrentRealPassword(null);
                  }}
                  className="flex-1"
                >
                  ปิด
                </Button>
                {currentRealPassword && (
                  <Button
                    onClick={() => {
                      setShowRealPassword(false);
                      setPasswordDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    รีเซ็ตรหัสผ่าน
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
              <DialogDescription>
                กำหนดรหัสผ่านใหม่สำหรับ: {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  รหัสผ่านใหม่
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateNewPassword}
                    className="px-3"
                  >
                    สุ่ม
                  </Button>
                </div>
              </div>
              {newPassword && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>รหัสผ่านใหม่:</strong> {newPassword}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    กรุณาบันทึกรหัสผ่านนี้และแจ้งให้ผู้ใช้ทราบ
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setResetPasswordDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirmResetPassword}
                disabled={!newPassword}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                รีเซ็ตรหัสผ่าน
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
