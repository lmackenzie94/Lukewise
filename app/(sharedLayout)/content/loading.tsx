export default function ContentSkeleton() {
  return (
    <div className="container">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-gray-300 rounded-md w-full md:w-1/4 min-w-[200px] flex-shrink-0 h-screen animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 animate-pulse">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-md h-20"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
