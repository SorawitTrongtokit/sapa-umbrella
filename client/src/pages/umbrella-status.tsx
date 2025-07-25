import { Umbrella as UmbrellaIcon, User, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UmbrellaCard } from '@/components/umbrella-card';
import { LoadingPage } from '@/components/loading-skeletons';
import { UsageStats } from '@/components/usage-stats';
import { UserProfile } from '@/components/user-profile';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { getUmbrellasForLocation, LOCATIONS } from '@shared/schema';

export default function UmbrellaStatus() {
  const { 
    umbrellas, 
    activities,
    availableCount, 
    borrowedCount, 
    getRecentActivities,
    loading 
  } = useUmbrellaData();

  const recentActivities = getRecentActivities(5);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900 text-center">สถานะร่ม</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Real-time Umbrella Status</p>
        </div>
      </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
        {/* User Profile */}
        <UserProfile />
        
        {/* Usage Statistics - แสดงแค่ว่าง/ยืม */}
        <UsageStats 
          availableCount={availableCount}
          borrowedCount={borrowedCount}
        />

        {/* Location Sections */}
        {Object.values(LOCATIONS).map((location) => (
          <div key={location} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-900">{location}</h2>
              <span className="text-sm text-gray-500">
                ร่ม {getUmbrellasForLocation(location).join('-')}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getUmbrellasForLocation(location).map((umbrellaId) => (
                <UmbrellaCard 
                  key={umbrellaId} 
                  umbrella={umbrellas[umbrellaId] || {
                    id: umbrellaId,
                    status: 'available',
                    currentLocation: location,
                    history: []
                  }} 
                />
              ))}
            </div>
          </div>
        ))}

        {/* Recent Activity - แสดงจากใหม่ไปเก่า */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-base font-medium text-gray-900 mb-3">
              กิจกรรมล่าสุด 
              <span className="text-xs text-gray-500 ml-1">(ใหม่สุด → เก่าสุด)</span>
            </h3>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={`${activity.timestamp}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        activity.type === 'borrow' 
                          ? 'bg-orange-100' 
                          : 'bg-green-100'
                      }`}>
                        {activity.type === 'borrow' ? (
                          <ArrowUp className="w-4 h-4 text-orange-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'borrow' ? 'ยืม' : 'คืน'}ร่ม #{activity.umbrellaId}
                        </p>
                        <p className="text-xs text-gray-500">
                          ที่ {activity.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                      <div className="text-xs text-gray-300">
                        {Math.floor((Date.now() - activity.timestamp) / (1000 * 60))} นาทีที่แล้ว
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <UmbrellaIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">ยังไม่มีกิจกรรม</p>
                  <p className="text-xs text-gray-400">จะแสดงเมื่อมีการยืม-คืนร่ม</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
