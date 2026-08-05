export default function Placeholder({ title }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-gray-400">
        {title} view coming soon.
      </div>
    </div>
  );
}
