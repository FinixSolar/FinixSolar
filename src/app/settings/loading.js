export default function Loading() {
  return (
    <div className="bg-white rounded-xl p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-60 mb-6" />

      <div className="space-y-4">
        <div className="h-24 bg-gray-200 rounded" />

        <div className="h-24 bg-gray-200 rounded" />

        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
