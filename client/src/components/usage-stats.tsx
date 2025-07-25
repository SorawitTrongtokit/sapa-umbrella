import { Card, CardContent } from '@/components/ui/card';
import { Umbrella, Users } from 'lucide-react';

interface UsageStatsProps {
  availableCount: number;
  borrowedCount: number;
}

export function UsageStats({ availableCount, borrowedCount }: UsageStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <Umbrella className="text-green-600 w-5 h-5" />
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
              <Users className="text-orange-600 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{borrowedCount}</p>
              <p className="text-sm text-gray-600">ยืม</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
