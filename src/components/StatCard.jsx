export default function StatCard({ label, value, unit, sub, icon, tint }) {
  const tints = {
    gray: "bg-white border-gray-200",
    green: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
    purple: "bg-violet-50 border-violet-100",
  };
  const labelColor = {
    gray: "text-gray-500",
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
    purple: "text-violet-700",
  };

  return (
    <div className={`flex flex-col justify-between rounded-xl border p-4 ${tints[tint]}`}>
      <div className="flex items-start justify-between">
        <span className={`text-sm font-medium ${labelColor[tint]}`}>{label}</span>
        {icon}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}
