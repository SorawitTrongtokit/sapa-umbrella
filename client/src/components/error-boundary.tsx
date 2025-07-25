import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
    
    // Log to a service if needed (within free tier)
    if (process.env.NODE_ENV === 'production') {
      // Could log to Firebase Analytics events (free)
      console.warn('Production error logged:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                เกิดข้อผิดพลาด
              </h2>
              <p className="text-gray-600 mb-4">
                ระบบมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                รีโหลดหน้าเว็บ
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    ข้อมูลข้อผิดพลาด (Development)
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
