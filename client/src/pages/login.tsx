import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';

import { userLoginSchema, UserLogin } from '../../../shared/schema';
import { userLogin, resetPassword } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useRateLimit } from '../hooks/use-rate-limit';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [location, navigate] = useLocation();
  
  const { isBlocked, remainingTime, recordAttempt, reset: resetRateLimit } = useRateLimit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserLogin>({
    resolver: zodResolver(userLoginSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async (data: UserLogin) => {
    if (isBlocked) {
      const minutes = Math.ceil(remainingTime / 60000);
      setError(`ถูกบล็อกเนื่องจากพยายามเข้าสู่ระบบมากเกินไป กรุณารอ ${minutes} นาที`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await userLogin(data.email, data.password);
      console.log('Login successful:', userCredential.user.uid);
      
      // Check if this is a temporary login
      if ((userCredential.user as any).isTemporaryLogin) {
        alert('เข้าสู่ระบบด้วย Temporary Password สำเร็จ!\n\nกรุณาเปลี่ยนรหัสผ่านใหม่ในหน้าโปรไฟล์');
      }
      
      // Reset rate limit on successful login
      resetRateLimit();
      
      // Wait a moment for auth state to update
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Record failed attempt
      recordAttempt();
      
      // Handle Firebase Auth errors
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'รหัสผ่านไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'บัญชีผู้ใช้นี้ถูกปิดใช้งาน';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในภายหลัง';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!emailValue) {
      setError('กรุณากรอกอีเมลก่อนกดรีเซ็ตรหัสผ่าน');
      return;
    }

    try {
      setResetLoading(true);
      setError(null);
      
      await resetPassword(emailValue);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบบัญชีผู้ใช้นี้';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
      
      setError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            เข้าสู่ระบบ
          </CardTitle>
          <CardDescription className="text-gray-600">
            ระบบยืม-คืนร่ม PCSHSPL
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isBlocked && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  ระบบถูกล็อกเนื่องจากมีการพยายามเข้าสู่ระบบมากเกินไป 
                  <br />กรุณารอ {Math.ceil(remainingTime / 60000)} นาที
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resetSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบอีเมล
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@pccpl.ac.th"
                {...register('email')}
                disabled={loading || resetLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่าน"
                  {...register('password')}
                  disabled={loading || resetLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || resetLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || resetLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-500"
                onClick={handleResetPassword}
                disabled={loading || resetLoading || !emailValue}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    กำลังส่งลิงก์รีเซ็ต...
                  </>
                ) : (
                  'ลืมรหัสผ่าน?'
                )}
              </Button>
              
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
