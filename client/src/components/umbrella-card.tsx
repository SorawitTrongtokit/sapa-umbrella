import { Umbrella as UmbrellaIcon, User } from 'lucide-react';
import type { Umbrella } from '@shared/schema';

interface UmbrellaCardProps {
  umbrella: Umbrella;
}

export function UmbrellaCard({ umbrella }: UmbrellaCardProps) {
  const isAvailable = umbrella.status === 'available';
  
  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm border-2 text-center ${
      isAvailable 
        ? 'border-green-500' 
        : 'border-orange-500'
    }`}>
      {isAvailable ? (
        <UmbrellaIcon className="text-green-500 text-lg mb-1 mx-auto w-5 h-5" />
      ) : (
        <User className="text-orange-500 text-lg mb-1 mx-auto w-5 h-5" />
      )}
      <p className="text-xs font-medium text-gray-900">{umbrella.id}</p>
      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
        isAvailable ? 'bg-green-500' : 'bg-orange-500'
      }`} />
    </div>
  );
}
