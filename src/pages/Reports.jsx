import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { STATUS, statusCounts } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

export default function Reports() {
  const { designs } = useDesigns();
  const counts = statusCounts(designs);
  const needDiscussion = designs
    .filter((d) => d.status === STATUS.BEHIND)
    .sort((a, b) => (b.behindDays ?? 0) - (a.behindDays ?? 0));

  const cards = [
    { label: "On Track", value: counts.onTrack, tint: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { label: "At Risk", value: counts.atRisk, tint: "bg-amber-50 border-amber-100 text-amber-700" },
    { label: "Behind", value: counts.behind, tint: "bg-red-50 border-red-100 text-red-700" },
    { label: "Completed (This Week)", value: 4, tint: "bg-blue-50 border-blue-100 text-blue-700" },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Weekly Review (Week 3 – 11 Aug to 17 Aug)</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.tint}`}>
            <p className="text-sm font-medium">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Need Discussion</h2>
        <div className="divide-y divide-gray-50">
          {needDiscussion.map((d) => (
            <Link
              key={d.id}
              to={`/designs/${d.id}`}
              className="flex items-center justify-between py-3 text-sm hover:bg-gray-50/60"
            >
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">{d.id}</span>
                <span className="text-gray-600">{d.customer}</span>
                <span className="text-gray-500">Day {d.day} / 30</span>
                <span className="font-medium text-red-600">
                  Behind {d.behindDays} day{d.behindDays === 1 ? "" : "s"}
                </span>
                <span className="text-gray-500">{d.reason}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
          {needDiscussion.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">Nothing to discuss this week.</p>
          )}
        </div>
      </div>
    </div>
  );
}
