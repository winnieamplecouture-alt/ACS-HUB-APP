import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Target, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import { designStatus } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const MONTHLY_TARGET = 30;

export default function Dashboard() {
  const { designs } = useDesigns();

  const withStatus = useMemo(() => designs.map((d) => ({ d, status: designStatus(d) })), [designs]);

  const completed = withStatus.filter((x) => x.status.key === "completed");
  const inProgress = withStatus.filter((x) => ["on_track", "at_risk", "behind"].includes(x.status.key));
  const behind = withStatus.filter((x) => x.status.key === "behind");

  const onTimeCompleted = completed.filter((x) => !x.d.timeline.delay);
  const successRate = completed.length > 0 ? Math.round((onTimeCompleted.length / completed.length) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Customisation Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Which designs are on track, which are behind, and what needs action.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Monthly Target" value={MONTHLY_TARGET} unit="Designs" tint="gray" icon={<Target size={18} className="text-gray-400" />} />
        <StatCard label="Completed" value={completed.length} tint="green" icon={<CheckCircle2 size={18} className="text-emerald-500" />} />
        <StatCard label="In Progress" value={inProgress.length} tint="amber" icon={<Clock size={18} className="text-amber-500" />} />
        <StatCard label="Behind Schedule" value={behind.length} tint="red" icon={<AlertTriangle size={18} className="text-red-500" />} />
        <StatCard
          label="On-Time Success Rate"
          value={successRate === null ? "–" : `${successRate}%`}
          sub={successRate === null ? "No designs completed yet" : "Completed without delay"}
          tint="purple"
          icon={<TrendingUp size={18} className="text-violet-500" />}
        />
      </div>

      <div className="rounded-xl border border-red-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="text-base font-semibold text-gray-900">Designs Need Attention</h2>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{behind.length}</span>
        </div>
        <div className="mt-4 space-y-2">
          {behind.map(({ d, status }) => (
            <Link
              key={d.id}
              to={`/designs/${d.id}`}
              className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 hover:bg-red-100/70"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{d.id}</span>
                <span className="text-sm text-gray-600">{d.customer}</span>
                <span className="text-sm text-gray-500">Day {status.currentDay} / {d.timeline.milestones.at(-1)?.day}</span>
              </div>
              <span className="text-sm font-medium text-red-600">
                Next: {status.nextMilestone.label} (Day {status.nextMilestone.day})
              </span>
            </Link>
          ))}
          {behind.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Nothing behind right now.</p>}
        </div>
        {behind.length > 0 && (
          <Link to="/designs?status=behind" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            View all ({behind.length})
          </Link>
        )}
      </div>
    </div>
  );
}
