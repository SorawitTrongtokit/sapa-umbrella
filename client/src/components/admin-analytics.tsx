import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Calendar, Users, Clock, 
  BarChart3, Activity, MapPin, AlertTriangle 
} from 'lucide-react';

interface AnalyticsProps {
  activities: any[];
  umbrellas: Record<number, any>;
}

export function AdminAnalytics({ activities, umbrellas }: AnalyticsProps) {
  // คำนวณข้อมูลสถิติ
  const now = new Date();
  
  // วันนี้
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayActivities = activities.filter(a => 
    new Date(a.timestamp) >= todayStart
  );
  
  // สัปดาห์นี้ (จันทร์-อาทิตย์)
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekActivities = activities.filter(a => 
    new Date(a.timestamp) >= weekStart
  );
  
  // เดือนนี้
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthActivities = activities.filter(a => 
    new Date(a.timestamp) >= monthStart
  );
  
  // คำนวณสถิติแต่ละช่วง
  const getStats = (activityList: any[]) => {
    const borrows = activityList.filter(a => a.type === 'borrow').length;
    const returns = activityList.filter(a => a.type === 'return').length;
    const uniqueUsers = new Set(
      activityList
        .filter(a => a.nickname)
        .map(a => a.nickname)
    ).size;
    
    return { borrows, returns, uniqueUsers };
  };
  
  const todayStats = getStats(todayActivities);
  const weekStats = getStats(weekActivities);
  const monthStats = getStats(monthActivities);
  
  // สถิติตามสถานที่
  const locationStats = Object.values({
    'ใต้โดม': { borrowed: 0, available: 0 },
    'ศูนย์กีฬา': { borrowed: 0, available: 0 },
    'โรงอาหาร': { borrowed: 0, available: 0 }
  });
  
  Object.values(umbrellas).forEach((umbrella: any) => {
    const location = umbrella.currentLocation;
    const status = umbrella.status;
    
    if (location in locationStats && (status === 'borrowed' || status === 'available')) {
      const locationData = locationStats[location as keyof typeof locationStats] as { borrowed: number; available: number };
      if (status === 'borrowed') {
        locationData.borrowed++;
      } else if (status === 'available') {
        locationData.available++;
      }
    }
  });
  
  // ร่มที่ใช้บ่อยที่สุด
  const umbrellaUsage = Object.values(umbrellas).map((umbrella: any) => ({
    id: umbrella.id,
    usage: activities.filter(a => a.umbrellaId === umbrella.id).length,
    location: umbrella.currentLocation
  })).sort((a, b) => b.usage - a.usage);
  
  // Peak hours
  const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    borrows: activities.filter(a => 
      new Date(a.timestamp).getHours() === hour && a.type === 'borrow'
    ).length
  }));
  
  const peakHour = hourlyStats.reduce((max, current) => 
    current.borrows > max.borrows ? current : max
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
        <Badge variant="outline" className="text-blue-600">
          อัพเดตล่าสุด: {now.toLocaleTimeString('th-TH')}
        </Badge>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">รายวัน</TabsTrigger>
          <TabsTrigger value="weekly">รายสัปดาห์</TabsTrigger>
          <TabsTrigger value="monthly">รายเดือน</TabsTrigger>
        </TabsList>

        {/* Daily Stats */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยืมวันนี้</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{todayStats.borrows}</div>
                <p className="text-xs text-muted-foreground">
                  {todayStats.borrows > 0 ? `${Math.round(todayStats.borrows / 21 * 100)}% ของร่มทั้งหมด` : 'ยังไม่มีการยืม'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คืนวันนี้</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{todayStats.returns}</div>
                <p className="text-xs text-muted-foreground">
                  {todayStats.returns === todayStats.borrows ? 'คืนครบแล้ว' : 
                   todayStats.returns > todayStats.borrows ? 'คืนมากกว่ายืม' : 
                   `เหลือคืน ${todayStats.borrows - todayStats.returns} คัน`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ผู้ใช้วันนี้</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{todayStats.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {todayStats.uniqueUsers > 0 ? `${(todayStats.uniqueUsers / 800 * 100).toFixed(1)}% ของนักเรียนทั้งหมด` : 'ยังไม่มีผู้ใช้'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weekly Stats */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยืมสัปดาห์นี้</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{weekStats.borrows}</div>
                <p className="text-xs text-muted-foreground">
                  เฉลี่ย {Math.round(weekStats.borrows / 7)} ครั้ง/วัน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คืนสัปดาห์นี้</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{weekStats.returns}</div>
                <p className="text-xs text-muted-foreground">
                  อัตราคืน {weekStats.borrows > 0 ? Math.round(weekStats.returns / weekStats.borrows * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ผู้ใช้สัปดาห์นี้</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{weekStats.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  เฉลี่ย {Math.round(weekStats.uniqueUsers / 7)} คน/วัน
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Stats */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ยืมเดือนนี้</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{monthStats.borrows}</div>
                <p className="text-xs text-muted-foreground">
                  เฉลี่ย {Math.round(monthStats.borrows / now.getDate())} ครั้ง/วัน
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">คืนเดือนนี้</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{monthStats.returns}</div>
                <p className="text-xs text-muted-foreground">
                  อัตราคืน {monthStats.borrows > 0 ? Math.round(monthStats.returns / monthStats.borrows * 100) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ผู้ใช้เดือนนี้</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{monthStats.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {(monthStats.uniqueUsers / 800 * 100).toFixed(1)}% ของนักเรียนทั้งหมด
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              สถิติตามสถานที่
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {['ใต้โดม', 'ศูนย์กีฬา', 'โรงอาหาร'].map((location, index) => (
              <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{location}</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ว่าง: {locationStats[index].available}
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    ยืม: {locationStats[index].borrowed}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Peak Hour & Popular Umbrellas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              ข้อมูลเพิ่มเติม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">⏰ ช่วงเวลายอดนิยม</span>
                <Badge className="bg-blue-600">
                  {peakHour.hour.toString().padStart(2, '0')}:00-{(peakHour.hour + 1).toString().padStart(2, '0')}:00
                </Badge>
              </div>
              <p className="text-xs text-blue-600 mt-1">{peakHour.borrows} ครั้งการยืม</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-800">🏆 ร่มยอดนิยม</span>
                <Badge className="bg-purple-600">
                  #{umbrellaUsage[0]?.id}
                </Badge>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                ใช้งาน {umbrellaUsage[0]?.usage || 0} ครั้ง ที่ {umbrellaUsage[0]?.location}
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-800">📈 อัตราการใช้งาน</span>
                <Badge className="bg-yellow-600">
                  {Math.round(Object.values(umbrellas).filter((u: any) => u.status === 'borrowed').length / 21 * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-yellow-600 mt-1">ของร่มทั้งหมด 21 คัน</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
