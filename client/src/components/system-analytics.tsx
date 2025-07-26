import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Users, AlertTriangle, Download } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface AnalyticsData {
  totalUsers: number;
  totalErrors: number;
  totalPageViews: number;
  averageSessionTime: number;
  topPages: Array<{ page: string; count: number }>;
  errorTrends: Array<{ date: string; count: number }>;
  recentErrors: Array<{ message: string; timestamp: string; context?: string }>;
}

export function SystemAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    setLoading(true);
    
    try {
      const events = analytics.getEvents();
      const userStats = analytics.getUserStats();
      
      // Process events for analytics
      const pageViews = events.filter(e => e.name === 'page_view');
      const errors = events.filter(e => e.name === 'error');
      const userActions = events.filter(e => e.name === 'user_action');

      // Calculate top pages
      const pageCount: Record<string, number> = {};
      pageViews.forEach(event => {
        const page = event.parameters?.page || 'Unknown';
        pageCount[page] = (pageCount[page] || 0) + 1;
      });

      const topPages = Object.entries(pageCount)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Error trends by day
      const errorsByDay: Record<string, number> = {};
      errors.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        errorsByDay[date] = (errorsByDay[date] || 0) + 1;
      });

      const errorTrends = Object.entries(errorsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Recent errors
      const recentErrors = errors
        .slice(-10)
        .map(event => ({
          message: event.parameters?.message || 'Unknown error',
          timestamp: event.timestamp,
          context: event.parameters?.context
        }))
        .reverse();

      setAnalyticsData({
        totalUsers: userActions.length > 0 ? 1 : 0, // Simple estimation
        totalErrors: errors.length,
        totalPageViews: pageViews.length,
        averageSessionTime: 0, // Would need session tracking
        topPages,
        errorTrends,
        recentErrors
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const events = analytics.getEvents();
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearAnalytics = () => {
    analytics.clearEvents();
    loadAnalyticsData();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">ไม่สามารถโหลดข้อมูลได้</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ระบบวิเคราะห์การใช้งาน</h3>
        <div className="space-x-2">
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            ส่งออกข้อมูล
          </Button>
          <Button onClick={clearAnalytics} variant="outline" size="sm">
            ล้างข้อมูล
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การเข้าชมหน้า</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPageViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้งาน</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข้อผิดพลาด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analyticsData.totalErrors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ประสิทธิภาพ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">ดี</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">หน้าที่ได้รับความนิยม</TabsTrigger>
          <TabsTrigger value="errors">ข้อผิดพลาด</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>หน้าที่เข้าชมมากที่สุด</CardTitle>
              <CardDescription>
                สถิติการเข้าชมหน้าต่างๆ ในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.topPages.map((page, index) => (
                  <div key={page.page} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{page.page}</span>
                    </div>
                    <span className="font-medium">{page.count} ครั้ง</span>
                  </div>
                ))}
                {analyticsData.topPages.length === 0 && (
                  <p className="text-muted-foreground">ไม่มีข้อมูลการเข้าชม</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อผิดพลาดล่าสุด</CardTitle>
              <CardDescription>
                รายการข้อผิดพลาดที่เกิดขึ้นในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentErrors.map((error, index) => (
                  <div key={index} className="border rounded p-3 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-red-800">{error.message}</p>
                        {error.context && (
                          <p className="text-sm text-red-600 mt-1">Context: {error.context}</p>
                        )}
                      </div>
                      <span className="text-xs text-red-500">
                        {new Date(error.timestamp).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                ))}
                {analyticsData.recentErrors.length === 0 && (
                  <p className="text-muted-foreground">ไม่มีข้อผิดพลาด 🎉</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
