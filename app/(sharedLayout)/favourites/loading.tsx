export default function FavouritesSkeleton() {
  return (
    <div className="container max-w-screen-sm grid grid-cols-1 gap-8">
      {Array.from({ length: Math.min(3, 10) }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 px-4 py-20 rounded-md animate-pulse"
        >
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
