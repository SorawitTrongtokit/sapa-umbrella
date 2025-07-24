import { Umbrella as UmbrellaIcon, User, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UmbrellaCard } from '@/components/umbrella-card';
import { useUmbrellaData } from '@/hooks/use-umbrella-data';
import { getUmbrellasForLocation, LOCATIONS } from '@shared/schema';

export default function UmbrellaStatus() {
  const { 
    umbrellas, 
    availableCount, 
    borrowedCount, 
    getRecentActivities,
    loading 
  } = useUmbrellaData();

  const recentActivities = getRecentActivities(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
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

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <UmbrellaIcon className="text-green-600 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
                  <p className="text-sm text-gray-600">ว่าง</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <User className="text-orange-600 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{borrowedCount}</p>
                  <p className="text-sm text-gray-600">ยืม</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Recent Activity */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-base font-medium text-gray-900 mb-3">กิจกรรมล่าสุด</h3>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        activity.type === 'borrow' 
                          ? 'bg-orange-100' 
                          : 'bg-green-100'
                      }`}>
                        {activity.type === 'borrow' ? (
                          <ArrowUp className={`w-4 h-4 ${
                            activity.type === 'borrow' 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`} />
                        ) : (
                          <ArrowDown className={`w-4 h-4 ${
                            activity.type === 'borrow' 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'borrow' ? 'ยืม' : 'คืน'}ร่ม #{activity.umbrellaId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type === 'borrow' && activity.nickname 
                            ? `โดย ${activity.nickname}` 
                            : `ที่ ${activity.location}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีกิจกรรม</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
