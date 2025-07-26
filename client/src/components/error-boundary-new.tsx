import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ 
      error, 
      errorInfo 
    });

    // Enhanced error logging for development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Details');
      console.error('Error:', error);
      console.error('Error Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    
    // Log to a service if needed (within free tier)
    if (import.meta.env.PROD) {
      console.warn('Production error logged:', error.message);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message?.includes('Firebase') || 
                             this.state.error?.message?.includes('auth/') ||
                             this.state.error?.message?.includes('invalid-api-key') ||
                             this.state.error?.stack?.includes('firebase');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-4">
            {/* Main Error Card */}
            <Card className="border-red-200">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {isFirebaseError ? 'ปัญหาการเชื่อมต่อฐานข้อมูล' : 'เกิดข้อผิดพลาด'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {isFirebaseError 
                    ? 'ระบบไม่สามารถเชื่อมต่อกับ Firebase ได้ กรุณาตรวจสอบการตั้งค่า'
                    : 'ระบบมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง'
                  }
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    ลองใหม่
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={this.handleReload}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCcw className="w-4 h-4 mr-1" />
                      รีโหลด
                    </Button>
                    <Button 
                      onClick={this.handleGoHome}
                      variant="outline"
                      size="sm"
                    >
                      <Home className="w-4 h-4 mr-1" />
                      หน้าหลัก
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Firebase Specific Help */}
            {isFirebaseError && (
              <Alert className="border-blue-200 bg-blue-50">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">💡 วิธีแก้ไขสำหรับ Developer</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>1. ตรวจสอบไฟล์ <code className="bg-blue-100 px-1 rounded">.env</code> ว่ามี Firebase config ครบ</p>
                      <p>2. ตรวจสอบ Firebase Project ใน Console</p>
                      <p>3. ระบบจะใช้ Mock Firebase สำหรับทดสอบ</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Development Error Details</h4>
                    <div className="text-xs bg-red-50 p-2 rounded">
                      <div><strong>Error:</strong> {this.state.error.name}</div>
                      <div><strong>Message:</strong> {this.state.error.message}</div>
                    </div>
                    {this.state.error.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Stack Trace</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* System Info */}
            <div className="text-center text-xs text-gray-500">
              <p>PCSHSPL Umbrella System</p>
              <p>Environment: {import.meta.env.MODE} | Time: {new Date().toLocaleString('th-TH')}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
