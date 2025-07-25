export function UmbrellaCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border-2 border-gray-200 text-center animate-pulse">
      <div className="w-5 h-5 bg-gray-200 rounded mx-auto mb-1"></div>
      <div className="w-4 h-4 bg-gray-200 rounded mx-auto mb-1"></div>
      <div className="w-2 h-2 bg-gray-200 rounded-full mx-auto"></div>
    </div>
  );
}

export function StatusCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
        <div>
          <div className="w-12 h-6 bg-gray-200 rounded mb-1"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
      <div className="flex-1">
        <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </div>
      <div className="w-12 h-3 bg-gray-200 rounded"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <StatusCardSkeleton />
          <StatusCardSkeleton />
        </div>

        {/* Location Sections Skeleton */}
        {[1, 2, 3].map((section) => (
          <div key={section} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <UmbrellaCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}

        {/* Recent Activity Skeleton */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="w-20 h-5 bg-gray-200 rounded mb-3 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
