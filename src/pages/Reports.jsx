import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { designStatus } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

export default function Reports() {
  const { designs } = useDesigns();
  const withStatus = useMemo(() => designs.map((d) => ({ d, status: designStatus(d) })), [designs]);

  const onTrack = withStatus.filter((x) => x.status.key === "on_track");
  const atRisk = withStatus.filter((x) => x.status.key === "at_risk");
  const behind = withStatus.filter((x) => x.status.key === "behind");
  const needDiscussion = [...behind, ...atRisk];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Weekly Review</h1>
        <p className="mt-1 text-sm text-gray-500">The meeting only discusses the red and yellow items.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">🟢 On Track</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{onTrack.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">🟡 At Risk</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{atRisk.length}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">🔴 Behind</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{behind.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Need Discussion</h2>
        <div className="divide-y divide-gray-50">
          {needDiscussion.map(({ d, status }) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDay = new Date(status.nextMilestone.targetDate);
            dueDay.setHours(0, 0, 0, 0);
            const lateDays = status.key === "behind" ? Math.round((today - dueDay) / 86400000) : null;
            const delay = d.timeline?.delay;
            return (
              <Link key={d.uid} to={`/designs/${d.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-gray-50/60">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="shrink-0 font-medium text-gray-900">{d.id}</span>
                  <span className="shrink-0 text-gray-500">{d.customer}</span>
                  <StatusPill status={status} />
                  <span className="shrink-0 text-gray-500">{lateDays !== null ? `Late ${lateDays} day${lateDays === 1 ? "" : "s"}` : "Due today"}</span>
                </div>
                <div className="flex min-w-0 flex-1 justify-end gap-6 text-right text-xs text-gray-500">
                  <span className="truncate">Reason: {delay?.reason ?? "–"}</span>
                  <span className="truncate">Decision: {delay?.action || "–"}</span>
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-400" />
              </Link>
            );
          })}
          {needDiscussion.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Nothing to discuss this week.</p>}
        </div>
      </div>
    </div>
  );
}
