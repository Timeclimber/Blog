export const ArticleCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
)

export const ArticleDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>
  </div>
)

export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-6 mb-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between py-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex justify-between py-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex justify-between py-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
)